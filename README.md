# 📝 ComfyUI Prompt Edit Node

<div align="center">

**一个强大的 ComfyUI 自定义节点，让你在工作流执行过程中暂停并编辑文本提示词**

[![ComfyUI](https://img.shields.io/badge/ComfyUI-Custom%20Node-blue)](https://github.com/comfyanonymous/ComfyUI)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.8+-yellow.svg)](https://www.python.org/)

[English](#english) | [中文](#中文)

</div>

---

## 中文

### 📖 简介

**Prompt Edit** 是一个为 ComfyUI 设计的自定义节点，它允许你在工作流执行过程中暂停，编辑文本提示词，然后继续执行。这对于需要在生成过程中动态调整提示词的场景非常有用。

### ✨ 核心特性

- 🔌 **连线输入** - 通过连线接收其他节点的文本输出
- ⏸️ **暂停执行** - 工作流在此节点暂停，等待用户编辑
- 📝 **双重编辑模式**
  - 节点内大文本框（200px 高）- 快速编辑
  - 弹出式大编辑器（800x400px）- 详细编辑
- 🎯 **灵活操作**
  - 自动弹出编辑对话框
  - 可关闭对话框，在节点内编辑
  - 可随时重新打开大编辑器
- ✅ **智能控制**
  - "继续执行" - 确认编辑，工作流继续
  - "取消" - 关闭对话框，继续编辑
- 🛡️ **健壮设计** - 完善的错误处理，对话框在任何情况下都能正常关闭

### 🚀 安装

#### 方法 1：手动安装

1. 进入 ComfyUI 的 `custom_nodes` 目录：
```bash
cd ComfyUI/custom_nodes
```

2. 克隆此仓库：
```bash
git clone https://github.com/your-username/Comfyui_Prompt_Edit.git
```

3. 重启 ComfyUI

#### 方法 2：直接下载

1. 下载此仓库的 ZIP 文件
2. 解压到 `ComfyUI/custom_nodes/Comfyui_Prompt_Edit`
3. 重启 ComfyUI

### 📦 目录结构

```
Comfyui_Prompt_Edit/
├── __init__.py              # 主节点实现（后端）
├── web/
│   └── prompt_edit.js       # 前端 UI 实现
├── README.md                # 本文档
├── EXAMPLE.md               # 使用示例
└── test_node.py             # 测试脚本
```

### 🎯 使用方法

#### 1. 添加节点

在 ComfyUI 界面中：
```
右键点击空白处 → Add Node → Ken-Chen → Prompt Edit ✏️
```

#### 2. 连接节点

```
[文本源节点] → [Prompt Edit] → [目标节点]
     ↓              ↓              ↓
  (输出文本)    (编辑文本)    (接收编辑后的文本)
```

**示例工作流**：
```
[Primitive STRING] → [Prompt Edit] → [Show Text]
```

#### 3. 运行工作流

1. 点击 **Queue Prompt** 运行工作流
2. 当执行到 Prompt Edit 节点时，工作流会暂停
3. 自动弹出编辑对话框

#### 4. 编辑文本

**方式 A：在弹出对话框中编辑**
- 对话框会自动弹出（800x400px）
- 在大文本框中编辑
- 点击 **✓ 继续执行** 确认

**方式 B：在节点内编辑**
- 点击对话框的 **✗ 取消** 关闭对话框
- 在节点内的文本框中编辑（200px 高）
- 点击节点内的 **✓ 继续执行** 确认

**方式 C：混合编辑**
- 在节点内编辑一部分
- 点击 **📝 打开大编辑器** 重新打开对话框
- 在对话框中继续编辑
- 点击 **✓ 继续执行** 确认

#### 5. 继续执行

点击 **✓ 继续执行** 后：
- 编辑后的文本会传递给下游节点
- 工作流继续执行

### 🎨 节点界面

```
┌─────────────────────────────────┐
│  Prompt Edit ✏️                 │
├─────────────────────────────────┤
│ ● text (输入端口)               │
│                                 │
│ ┌─────────────────────────────┐ │
│ │                             │ │
│ │  多行文本编辑框              │ │
│ │  (200px 高)                 │ │
│ │                             │ │
│ └─────────────────────────────┘ │
│                                 │
│ [📝 打开大编辑器]               │
│ [✓ 继续执行]                    │
│                                 │
│ ● edited_text (输出端口)        │
└─────────────────────────────────┘
```

### 📋 完整示例

#### 示例 1：基础文本编辑

```
工作流：
[Primitive STRING] → [Prompt Edit] → [Show Text]

步骤：
1. 在 Primitive STRING 中输入：
   "a beautiful sunset"

2. 运行工作流

3. Prompt Edit 节点暂停，对话框弹出

4. 编辑文本为：
   "a beautiful sunset over the ocean, golden hour, cinematic"

5. 点击 "✓ 继续执行"

6. Show Text 显示编辑后的文本
```

#### 示例 2：多次编辑

```
工作流：
[Text Node] → [Prompt Edit] → [Another Prompt Edit] → [Final Output]

说明：
- 可以在工作流中添加多个 Prompt Edit 节点
- 每个节点都会暂停并等待编辑
- 适合需要多次调整的复杂工作流
```

#### 示例 3：条件编辑

```
工作流：
[Generate Text] → [Prompt Edit] → [Image Generation]

用途：
- 自动生成初始提示词
- 人工审核和优化
- 生成最终图像
```

### ⚙️ 技术细节

#### 节点参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `text` | STRING (输入) | 从其他节点接收的文本（强制连线输入） |
| `edited_text_widget` | STRING (widget) | 节点内的多行文本编辑框 |
| `edited_text` | STRING (输出) | 编辑后的文本输出 |

#### 工作原理

1. **接收文本**：节点通过 `text` 输入端口接收文本
2. **创建会话**：生成唯一的 `session_id`
3. **发送到前端**：通过 WebSocket 发送文本到前端
4. **暂停执行**：后端进入轮询循环，每 100ms 检查一次确认状态
5. **用户编辑**：前端显示编辑界面，用户编辑文本
6. **确认编辑**：用户点击"继续执行"，前端调用 API 确认
7. **继续执行**：后端检测到确认，返回编辑后的文本
8. **清理会话**：删除会话数据

#### API 端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `/prompt_edit/update` | POST | 更新文本（自动保存，500ms 防抖） |
| `/prompt_edit/confirm` | POST | 确认编辑，继续执行 |
| `/prompt_edit/cancel` | POST | 取消对话框（工作流继续等待） |

#### 超时设置

- 默认超时：**1 小时**
- 超时后自动抛出异常，停止工作流
- 可在代码中修改 `timeout` 变量

### 🔧 高级配置

#### 修改超时时间

编辑 `__init__.py`，找到以下代码：

```python
timeout = 3600  # 1 hour timeout
```

修改为你需要的秒数，例如：
```python
timeout = 7200  # 2 hours
```

#### 修改对话框大小

编辑 `web/prompt_edit.js`，找到以下代码：

```javascript
dialog.style.cssText = `
    min-width: 800px;
    max-width: 90vw;
    ...
`;

textarea.style.cssText = `
    ...
    min-height: 400px;
    max-height: 70vh;
    ...
`;
```

根据需要调整尺寸。

### 🐛 故障排除

#### 问题 1：节点没有输入端口

**症状**：节点左侧没有绿色的 `text` 输入端口

**解决方案**：
1. 重启 ComfyUI 服务器
2. 清除浏览器缓存（Ctrl+Shift+Delete）
3. 硬刷新浏览器（Ctrl+F5）

#### 问题 2：对话框无法关闭

**症状**：点击"取消"或"继续执行"后对话框不关闭

**解决方案**：
1. 检查浏览器控制台是否有错误
2. 确保使用最新版本的代码
3. 重启 ComfyUI 并刷新浏览器

#### 问题 3：文本框是单行的

**症状**：节点内的文本框只有一行，无法显示多行文本

**解决方案**：
1. 确保 `__init__.py` 中 `edited_text_widget` 的 `multiline` 设置为 `True`
2. 重启 ComfyUI
3. 清除浏览器缓存并刷新

### 📚 使用场景

- ✅ **图像生成**：在生成图像前微调提示词
- ✅ **批量处理**：对每个项目进行个性化调整
- ✅ **工作流调试**：检查和修改中间结果
- ✅ **质量控制**：人工审核自动生成的内容
- ✅ **创意迭代**：快速测试不同的提示词变体

### 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 📄 许可证

MIT License

---

## English

### 📖 Introduction

**Prompt Edit** is a custom node for ComfyUI that allows you to pause workflow execution, edit text prompts, and then continue. This is very useful for scenarios where you need to dynamically adjust prompts during the generation process.

### ✨ Key Features

- 🔌 **Wired Input** - Receives text output from other nodes via connections
- ⏸️ **Pause Execution** - Workflow pauses at this node, waiting for user editing
- 📝 **Dual Edit Modes**
  - Large text box inside node (200px height) - Quick editing
  - Popup large editor (800x400px) - Detailed editing
- 🎯 **Flexible Operations**
  - Auto-popup edit dialog
  - Can close dialog and edit in node
  - Can reopen large editor anytime
- ✅ **Smart Controls**
  - "Continue" - Confirm edits, workflow continues
  - "Cancel" - Close dialog, continue editing
- 🛡️ **Robust Design** - Comprehensive error handling, dialog can always be closed

### 🚀 Installation

#### Method 1: Manual Installation

1. Navigate to ComfyUI's `custom_nodes` directory:
```bash
cd ComfyUI/custom_nodes
```

2. Clone this repository:
```bash
git clone https://github.com/your-username/Comfyui_Prompt_Edit.git
```

3. Restart ComfyUI

#### Method 2: Direct Download

1. Download the ZIP file of this repository
2. Extract to `ComfyUI/custom_nodes/Comfyui_Prompt_Edit`
3. Restart ComfyUI

### 🎯 Usage

#### 1. Add Node

In ComfyUI interface:
```
Right-click → Add Node → Ken-Chen → Prompt Edit ✏️
```

#### 2. Connect Nodes

```
[Text Source Node] → [Prompt Edit] → [Target Node]
```

**Example Workflow**:
```
[Primitive STRING] → [Prompt Edit] → [Show Text]
```

#### 3. Run Workflow

1. Click **Queue Prompt** to run workflow
2. When execution reaches Prompt Edit node, workflow pauses
3. Edit dialog automatically pops up

#### 4. Edit Text

**Method A: Edit in popup dialog**
- Dialog auto-pops up (800x400px)
- Edit in large text area
- Click **✓ Continue** to confirm

**Method B: Edit in node**
- Click **✗ Cancel** to close dialog
- Edit in node's text box (200px height)
- Click **✓ Continue** in node to confirm

**Method C: Mixed editing**
- Edit partially in node
- Click **📝 Open Large Editor** to reopen dialog
- Continue editing in dialog
- Click **✓ Continue** to confirm

### ⚙️ Technical Details

#### Node Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `text` | STRING (input) | Text received from other nodes (forced input) |
| `edited_text_widget` | STRING (widget) | Multiline text editor inside node |
| `edited_text` | STRING (output) | Edited text output |

#### How It Works

1. **Receive Text**: Node receives text via `text` input port
2. **Create Session**: Generate unique `session_id`
3. **Send to Frontend**: Send text to frontend via WebSocket
4. **Pause Execution**: Backend enters polling loop, checks every 100ms
5. **User Edits**: Frontend displays edit interface
6. **Confirm Edit**: User clicks "Continue", frontend calls API
7. **Continue Execution**: Backend detects confirmation, returns edited text
8. **Cleanup Session**: Delete session data

#### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/prompt_edit/update` | POST | Update text (auto-save, 500ms debounce) |
| `/prompt_edit/confirm` | POST | Confirm edit, continue execution |
| `/prompt_edit/cancel` | POST | Cancel dialog (workflow keeps waiting) |

### 📚 Use Cases

- ✅ **Image Generation**: Fine-tune prompts before generating images
- ✅ **Batch Processing**: Personalize each item
- ✅ **Workflow Debugging**: Check and modify intermediate results
- ✅ **Quality Control**: Manually review auto-generated content
- ✅ **Creative Iteration**: Quickly test different prompt variations

### 🤝 Contributing

Issues and Pull Requests are welcome!

### 📄 License

MIT License
