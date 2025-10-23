/**
 * ComfyUI Prompt Edit Extension
 * Provides UI for editing prompts with pause/continue functionality
 */

import { app } from "../../scripts/app.js";
import { api } from "../../scripts/api.js";

// Store active edit dialogs
const activeDialogs = new Map();

// Create the edit dialog
function createEditDialog(sessionId, text, nodeId, onConfirmCallback, node = null) {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    `;

    // Create dialog container
    const dialog = document.createElement('div');
    dialog.style.cssText = `
        background: #2b2b2b;
        border: 2px solid #4a9eff;
        border-radius: 8px;
        padding: 20px;
        min-width: 800px;
        max-width: 90vw;
        max-height: 90vh;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        display: flex;
        flex-direction: column;
    `;

    // Create title
    const title = document.createElement('h3');
    title.textContent = '✏️ 编辑提示词';
    title.style.cssText = `
        margin: 0 0 10px 0;
        color: #4a9eff;
        font-size: 20px;
        font-weight: bold;
    `;

    // Create subtitle with instructions
    const subtitle = document.createElement('p');
    subtitle.textContent = '在下方编辑文本，完成后点击"继续执行"按钮';
    subtitle.style.cssText = `
        margin: 0 0 15px 0;
        color: #aaa;
        font-size: 14px;
    `;

    // Create textarea
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.cssText = `
        width: 100%;
        min-height: 400px;
        max-height: 70vh;
        padding: 15px;
        font-size: 16px;
        font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
        line-height: 1.6;
        background: #1a1a1a;
        color: #fff;
        border: 1px solid #555;
        border-radius: 4px;
        resize: vertical;
        box-sizing: border-box;
    `;

    // Create button container
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 15px;
    `;

    // Create confirm button
    const confirmButton = document.createElement('button');
    confirmButton.textContent = '✓ 继续执行';
    confirmButton.style.cssText = `
        padding: 10px 20px;
        background: #4CAF50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        font-weight: bold;
    `;
    confirmButton.onmouseover = () => {
        confirmButton.style.background = '#45a049';
    };
    confirmButton.onmouseout = () => {
        confirmButton.style.background = '#4CAF50';
    };

    // Create cancel button
    const cancelButton = document.createElement('button');
    cancelButton.textContent = '✗ 取消';
    cancelButton.style.cssText = `
        padding: 10px 20px;
        background: #f44336;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
    `;
    cancelButton.onmouseover = () => {
        cancelButton.style.background = '#da190b';
    };
    cancelButton.onmouseout = () => {
        cancelButton.style.background = '#f44336';
    };

    // Confirm button handler
    confirmButton.onclick = async () => {
        const editedText = textarea.value;

        try {
            const response = await api.fetchApi('/prompt_edit/confirm', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    session_id: sessionId,
                    edited_text: editedText
                })
            });

            if (response.ok) {
                // Call the callback if provided
                if (onConfirmCallback) {
                    onConfirmCallback(editedText);
                }

                // Clear session_id from node after confirmation
                if (node) {
                    node.session_id = null;
                }

                // Close dialog
                overlay.remove();
                activeDialogs.delete(sessionId);
            } else if (response.status === 404) {
                // Session not found - workflow already completed
                console.warn('Session not found, workflow already completed');
                alert('工作流已完成，无法继续编辑。请重新运行工作流。');
                // Close dialog anyway
                overlay.remove();
                activeDialogs.delete(sessionId);
                // Clear session_id from node
                if (node) {
                    node.session_id = null;
                }
            } else {
                console.error('Failed to confirm prompt edit');
                alert('确认失败，请重试');
            }
        } catch (error) {
            console.error('Error confirming prompt edit:', error);
            alert('确认失败: ' + error.message);
        }
    };

    // Cancel button handler
    cancelButton.onclick = async () => {
        try {
            const response = await api.fetchApi('/prompt_edit/cancel', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    session_id: sessionId
                })
            });

            if (response.ok) {
                // Close dialog
                overlay.remove();
                activeDialogs.delete(sessionId);
            } else if (response.status === 404) {
                // Session not found - just close the dialog
                console.warn('Session not found, closing dialog anyway');
                overlay.remove();
                activeDialogs.delete(sessionId);
            } else {
                console.error('Failed to cancel prompt edit');
                alert('取消失败，请重试');
            }
        } catch (error) {
            console.error('Error canceling prompt edit:', error);
            // Close dialog anyway
            overlay.remove();
            activeDialogs.delete(sessionId);
        }
    };

    // Auto-update text as user types (optional, for real-time sync)
    let updateTimeout;
    textarea.oninput = () => {
        clearTimeout(updateTimeout);
        updateTimeout = setTimeout(async () => {
            try {
                await api.fetchApi('/prompt_edit/update', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        session_id: sessionId,
                        edited_text: textarea.value
                    })
                });
            } catch (error) {
                console.error('Error updating prompt:', error);
            }
        }, 500);
    };

    // Assemble dialog
    buttonContainer.appendChild(cancelButton);
    buttonContainer.appendChild(confirmButton);

    dialog.appendChild(title);
    dialog.appendChild(subtitle);
    dialog.appendChild(textarea);
    dialog.appendChild(buttonContainer);

    overlay.appendChild(dialog);

    // Add to document
    document.body.appendChild(overlay);
    
    // Focus textarea
    textarea.focus();
    textarea.setSelectionRange(textarea.value.length, textarea.value.length);
    
    // Store dialog reference
    activeDialogs.set(sessionId, {
        overlay,
        textarea,
        confirmButton,
        cancelButton
    });
    
    return overlay;
}

// Register extension
app.registerExtension({
    name: "Comfy.PromptEdit",
    
    async setup() {
        // Listen for session_id from the server
        api.addEventListener("prompt_edit_session", (event) => {
            const { session_id, node_id, text } = event.detail;

            console.log('Prompt edit session received:', {
                session_id,
                node_id,
                text
            });

            // Find the node and store the session_id and text on it
            const node = app.graph._nodes.find(n => n.id == node_id);
            if (node) {
                node.session_id = session_id;
                node.current_text = text;

                // Update the text widget with the incoming text
                const textWidget = node.widgets.find(w => w.name === "edited_text_widget");
                if (textWidget && text) {
                    textWidget.value = text;
                    app.graph.setDirtyCanvas(true);
                }

                // Automatically open the edit dialog
                createEditDialog(session_id, text, node_id, (editedText) => {
                    // Update the node's text widget when dialog is confirmed
                    if (textWidget) {
                        textWidget.value = editedText;
                        node.current_text = editedText;
                        app.graph.setDirtyCanvas(true);
                    }
                }, node);

                console.log(`Session ID ${session_id} stored on node ${node_id}, dialog opened`);
            }
        });
    },
    
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        // Add custom styling or behavior to Prompt_Edit nodes if needed
        if (nodeData.name === "Prompt_Edit") {
            const onNodeCreated = nodeType.prototype.onNodeCreated;

            nodeType.prototype.onNodeCreated = function() {
                const result = onNodeCreated?.apply(this, arguments);

                // Add visual indicator that this node will pause execution
                this.color = "#2a5a2a";
                this.bgcolor = "#1a3a1a";

                // Store the current text
                this.current_text = "";

                // Store the current text
                this.current_text = "";

                // Find the multiline text widget (it's automatically created from INPUT_TYPES)
                // We'll update it when text arrives from the server

                // Add an "Open Large Editor" button that opens the dialog
                const editButton = this.addWidget("button", "📝 打开大编辑器", null, () => {
                    // Check if we have a valid session_id
                    if (!this.session_id) {
                        alert('请先运行工作流以加载文本');
                        return;
                    }

                    // Find the text widget
                    const textWidget = this.widgets.find(w => w.name === "edited_text_widget");
                    const currentText = textWidget ? textWidget.value : this.current_text;

                    if (currentText || this.current_text) {
                        // Open the edit dialog with current text
                        createEditDialog(this.session_id, currentText || this.current_text, this.id, (editedText) => {
                            // Callback to update the widget when dialog is confirmed
                            if (textWidget) {
                                textWidget.value = editedText;
                            }
                            this.current_text = editedText;
                            app.graph.setDirtyCanvas(true);
                        }, this);
                    } else {
                        alert('请先运行工作流以加载文本');
                    }
                });
                editButton.serialize = false;

                // Add a "Continue" button
                const continueButton = this.addWidget("button", "✓ 继续执行", null, () => {
                    // Find the text widget
                    const textWidget = this.widgets.find(w => w.name === "edited_text_widget");
                    const editedText = textWidget ? textWidget.value : this.current_text;

                    // Send confirmation to backend if we have a session_id
                    if (this.session_id) {
                        api.fetchApi('/prompt_edit/confirm', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                session_id: this.session_id,
                                edited_text: editedText
                            })
                        }).then(response => {
                            if (response.ok) {
                                console.log('Prompt edit confirmed');
                                // Clear session_id after confirmation
                                this.session_id = null;
                                // Visual feedback
                                continueButton.name = "✓ 已继续";
                                setTimeout(() => {
                                    continueButton.name = "✓ 继续执行";
                                }, 2000);
                            } else {
                                console.error('Failed to confirm prompt edit');
                                alert('确认失败，请重试');
                            }
                        }).catch(error => {
                            console.error('Error confirming prompt edit:', error);
                            alert('确认失败: ' + error.message);
                        });
                    } else {
                        alert('请先运行工作流');
                    }
                });
                continueButton.serialize = false;

                return result;
            };
        }
    }
});

console.log("Prompt Edit extension loaded");

