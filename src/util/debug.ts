import { GlobalState } from "@classes/vn-global-state";

/**
 * Convenience debugging utility for logging messages to the console.
 * @param message The message to log to the console.
 */
export function log(title: string | undefined, ...args: any[]) {
  // colored, outlined log message
  console.log(`[ --- ${new Date().toLocaleTimeString()} ${title ? `| ${title}` : ""} --- ]`);
  console.debug(...args);
}

export function notification({
  message,
  type = "info",
}: {
  message: string;
  type?: "info" | "bad" | "good" | "warn";
}) {
  const font = "Nunito, sans-serif";

  const colors = {
    info: "#3498db",
    bad: "#e74c3c",
    good: "#2ecc71",
    warn: "#f39c12",
  };

  const notif = document.createElement("div");
  notif.style.cssText = `
      background-color: ${colors[type]};
      color: white;
      padding: 1rem;
      margin-bottom: 1rem;
      border-radius: 0.5rem;
      box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.2);

      p.vn-notif-message {
        margin: 0;
        padding: 0;
      }
    `;

  notif.innerHTML = `<p class="vn-notif-message">${message}</p>`;

  // add custom properties to the notification element
  notif.dataset.type = type;

  notif.addEventListener("click", () => {
    notif.style.display = "none";
  });


  if (GlobalState.notificationsContainer) {
    GlobalState.notificationsContainer.appendChild(notif);
  } else {
    console.error("Could not find notifications container.");
  }
}

/**
 * A layman-accommodating function that throws an error without any technical jargon so that they can understand what they did wrong.
 * Seriously, haven't we all been there when we were just starting out? Getting the 'read the error' response is not helpful when
 * you can't even understand the f~ucking VOCABULARY.
 * @param friendly A friendly, living-organism-understandable error message.
 * @param lineNumber The line number where the error occurred in the script.
 * @param detailed The nerd version (optional, null by default. Prioritize adding the friendly error messages first.)
 * @throws {Error} Throws an error with the friendly message and the line number where the error occurred.
 */
export function error({
  friendly,
  lineNumber,
  detailed = null,
}: {
  friendly: string;
  lineNumber: number;
  detailed?: string | null;
}) {
  const message = `(Error on line ${lineNumber}):\n${friendly}`;
  console.error(message);
  notification({ message: message, type: "bad" });
  throw new Error(detailed || message);
}

