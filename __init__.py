"""
ComfyUI Prompt Edit Node
A node that pauses execution and allows users to edit the prompt text before continuing.
"""

import time
import uuid
import server
from aiohttp import web
import asyncio

# Global storage for pending prompts
pending_prompts = {}

class PromptEdit:
    """
    A node that receives text input, pauses execution, and waits for user to edit the text.
    """

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "text": ("STRING", {
                    "forceInput": True,  # 强制通过连线输入
                }),
                "edited_text_widget": ("STRING", {
                    "multiline": True,  # 多行文本框
                    "default": "",
                    "dynamicPrompts": False
                }),
            },
            "hidden": {
                "unique_id": "UNIQUE_ID",
                "prompt": "PROMPT",
                "extra_pnginfo": "EXTRA_PNGINFO",
            },
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("edited_text",)
    FUNCTION = "edit_prompt"
    CATEGORY = "Ken-Chen"
    OUTPUT_NODE = True

    def __init__(self):
        self.type = "Prompt_Edit"

    def edit_prompt(self, text, edited_text_widget, unique_id=None, prompt=None, extra_pnginfo=None):
        """
        Main function that pauses execution and waits for user input.
        """
        # Generate a unique session ID for this execution
        session_id = str(uuid.uuid4())

        # Use edited_text_widget if it has content, otherwise use incoming text
        if edited_text_widget and edited_text_widget.strip():
            final_text = edited_text_widget
        else:
            final_text = text

        # Store the initial text
        pending_prompts[session_id] = {
            "text": text,
            "unique_id": unique_id,
            "edited_text": final_text,
            "confirmed": False
        }

        # Send session_id and text to frontend (store it on the node)
        prompt_server = server.PromptServer.instance

        # Use asyncio to send the message
        try:
            loop = None
            try:
                loop = asyncio.get_running_loop()
            except RuntimeError:
                pass

            if loop is not None:
                # We're in an async context, create a task
                asyncio.create_task(
                    prompt_server.send_sync(
                        "prompt_edit_session",
                        {
                            "session_id": session_id,
                            "node_id": unique_id,
                            "text": text
                        },
                        prompt_server.client_id
                    )
                )
            else:
                # We're not in an async context, use run_coroutine_threadsafe
                asyncio.run_coroutine_threadsafe(
                    prompt_server.send_sync(
                        "prompt_edit_session",
                        {
                            "session_id": session_id,
                            "node_id": unique_id,
                            "text": text
                        },
                        prompt_server.client_id
                    ),
                    prompt_server.loop
                )
        except Exception as e:
            print(f"Error sending prompt edit session: {e}")

        # Wait for user to confirm (polling approach)
        timeout = 3600  # 1 hour timeout
        start_time = time.time()

        while not pending_prompts[session_id]["confirmed"]:
            time.sleep(0.1)  # Poll every 100ms

            # Check timeout
            if time.time() - start_time > timeout:
                print(f"Prompt edit timeout for session {session_id}")
                # Clean up
                del pending_prompts[session_id]
                raise Exception("编辑超时（1小时）")

        # Get the edited text
        edited_text = pending_prompts[session_id]["edited_text"]

        # Clean up
        del pending_prompts[session_id]

        return {
            "ui": {"text": [edited_text]},
            "result": (edited_text,)
        }


# Register the node
NODE_CLASS_MAPPINGS = {
    "Prompt_Edit": PromptEdit
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "Prompt_Edit": "Prompt Edit ✏️"
}

# Add server routes for handling user interactions
def add_routes(routes):
    """
    Add API routes for the prompt edit functionality.
    """
    
    @routes.post('/prompt_edit/update')
    async def update_prompt(request):
        """
        Update the edited text for a session.
        """
        try:
            data = await request.json()
            session_id = data.get("session_id")
            edited_text = data.get("edited_text")
            
            if session_id in pending_prompts:
                pending_prompts[session_id]["edited_text"] = edited_text
                return web.json_response({"status": "success"})
            else:
                return web.json_response(
                    {"status": "error", "message": "Session not found"},
                    status=404
                )
        except Exception as e:
            return web.json_response(
                {"status": "error", "message": str(e)},
                status=500
            )
    
    @routes.post('/prompt_edit/confirm')
    async def confirm_prompt(request):
        """
        Confirm the edited text and continue execution.
        """
        try:
            data = await request.json()
            session_id = data.get("session_id")
            edited_text = data.get("edited_text")
            
            if session_id in pending_prompts:
                pending_prompts[session_id]["edited_text"] = edited_text
                pending_prompts[session_id]["confirmed"] = True

                return web.json_response({"status": "success"})
            else:
                return web.json_response(
                    {"status": "error", "message": "Session not found"},
                    status=404
                )
        except Exception as e:
            return web.json_response(
                {"status": "error", "message": str(e)},
                status=500
            )
    
    @routes.post('/prompt_edit/cancel')
    async def cancel_prompt(request):
        """
        Cancel button just closes the dialog, workflow continues waiting.
        """
        try:
            data = await request.json()
            session_id = data.get("session_id")

            if session_id in pending_prompts:
                # Don't do anything - just acknowledge the cancel
                # The workflow will continue waiting for user to click "Continue" button
                return web.json_response({"status": "success"})
            else:
                return web.json_response(
                    {"status": "error", "message": "Session not found"},
                    status=404
                )
        except Exception as e:
            return web.json_response(
                {"status": "error", "message": str(e)},
                status=500
            )


# Register routes with the server
try:
    prompt_server = server.PromptServer.instance
    if prompt_server is not None:
        add_routes(prompt_server.routes)
except Exception as e:
    print(f"Warning: Could not register Prompt_Edit routes: {e}")

# Web directory for JavaScript extensions
import os
WEB_DIRECTORY = os.path.join(os.path.dirname(__file__), "web")

__all__ = ['NODE_CLASS_MAPPINGS', 'NODE_DISPLAY_NAME_MAPPINGS', 'WEB_DIRECTORY']

