import { format } from "date-fns";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
  thinking?: string;
}

interface ExportOptions {
  title?: string;
  model?: string;
  includeThinking?: boolean;
  includeTimestamps?: boolean;
}

export function exportToMarkdown(
  messages: Message[],
  options: ExportOptions = {}
): string {
  const {
    title = "Chat Export",
    model = "Unknown Model",
    includeThinking = false,
    includeTimestamps = true,
  } = options;

  let markdown = `# ${title}\n\n`;
  markdown += `**Model:** ${model}\n`;
  markdown += `**Exported:** ${format(new Date(), "PPpp")}\n`;
  markdown += `**Messages:** ${messages.length}\n\n`;
  markdown += `---\n\n`;

  messages.forEach((msg, idx) => {
    const roleIcon = msg.role === "user" ? "👤" : "🤖";
    const roleName = msg.role === "user" ? "User" : "Assistant";
    
    markdown += `### ${roleIcon} ${roleName}`;
    if (includeTimestamps && msg.timestamp) {
      markdown += ` — ${format(msg.timestamp, "PPp")}`;
    }
    markdown += `\n\n`;

    if (includeThinking && msg.thinking && msg.role === "assistant") {
      markdown += `<details>\n<summary>💭 Thinking Process</summary>\n\n`;
      markdown += `${msg.thinking}\n\n`;
      markdown += `</details>\n\n`;
    }

    markdown += `${msg.content}\n\n`;
  });

  return markdown;
}

export function exportToJSON(
  messages: Message[],
  options: ExportOptions = {}
): string {
  const {
    title = "Chat Export",
    model = "Unknown Model",
  } = options;

  const exportData = {
    title,
    model,
    exportedAt: new Date().toISOString(),
    messageCount: messages.length,
    messages: messages.map(msg => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp?.toISOString(),
      thinking: msg.thinking,
    })),
  };

  return JSON.stringify(exportData, null, 2);
}

export function exportToPlainText(
  messages: Message[],
  options: ExportOptions = {}
): string {
  const {
    title = "Chat Export",
    model = "Unknown Model",
    includeTimestamps = true,
  } = options;

  let text = `${title}\n`;
  text += `Model: ${model}\n`;
  text += `Exported: ${format(new Date(), "PPpp")}\n`;
  text += `${"=".repeat(50)}\n\n`;

  messages.forEach(msg => {
    const roleName = msg.role === "user" ? "USER" : "ASSISTANT";
    
    text += `[${roleName}]`;
    if (includeTimestamps && msg.timestamp) {
      text += ` (${format(msg.timestamp, "PPp")})`;
    }
    text += `\n`;
    text += `${msg.content}\n\n`;
  });

  return text;
}

export function downloadExport(
  content: string,
  filename: string,
  type: "md" | "json" | "txt"
): void {
  const mimeTypes = {
    md: "text/markdown",
    json: "application/json",
    txt: "text/plain",
  };

  const blob = new Blob([content], { type: mimeTypes[type] });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.${type}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

export function generatePDFContent(
  messages: Message[],
  options: ExportOptions = {}
): string {
  // Generate HTML that can be printed to PDF
  const {
    title = "Chat Export",
    model = "Unknown Model",
    includeThinking = false,
  } = options;

  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { color: #333; border-bottom: 2px solid #6366f1; padding-bottom: 10px; }
    .meta { color: #666; font-size: 14px; margin-bottom: 20px; }
    .message { margin: 20px 0; padding: 15px; border-radius: 8px; }
    .user { background: #f3f4f6; }
    .assistant { background: #eef2ff; border-left: 3px solid #6366f1; }
    .role { font-weight: 600; color: #374151; margin-bottom: 8px; }
    .content { white-space: pre-wrap; line-height: 1.6; }
    .thinking { background: #fffbeb; border: 1px solid #fcd34d; padding: 10px; border-radius: 4px; margin-bottom: 10px; font-size: 13px; color: #92400e; }
    code { background: #e5e7eb; padding: 2px 6px; border-radius: 4px; font-family: monospace; }
    pre { background: #1f2937; color: #f9fafb; padding: 15px; border-radius: 8px; overflow-x: auto; }
    @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <div class="meta">
    <p><strong>Model:</strong> ${model}</p>
    <p><strong>Exported:</strong> ${format(new Date(), "PPpp")}</p>
    <p><strong>Messages:</strong> ${messages.length}</p>
  </div>
`;

  messages.forEach(msg => {
    const roleClass = msg.role;
    const roleName = msg.role === "user" ? "👤 User" : "🤖 Assistant";
    
    html += `<div class="message ${roleClass}">`;
    html += `<div class="role">${roleName}</div>`;
    
    if (includeThinking && msg.thinking && msg.role === "assistant") {
      html += `<div class="thinking"><strong>💭 Thinking:</strong><br>${msg.thinking}</div>`;
    }
    
    // Basic markdown processing
    let content = msg.content
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
    
    html += `<div class="content">${content}</div>`;
    html += `</div>`;
  });

  html += `
</body>
</html>`;

  return html;
}

export function printToPDF(
  messages: Message[],
  options: ExportOptions = {}
): void {
  const html = generatePDFContent(messages, options);
  
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  }
}
