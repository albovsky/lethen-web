const button = document.querySelector('#copy');
const label = document.querySelector('#copy-label');
const status = document.querySelector('#copy-status');
const command = document.querySelector('#install-command');
let resetTimer;

// The command remains selectable when JavaScript or clipboard access is unavailable.
if (navigator.clipboard?.writeText) {
  button.hidden = false;
  button.addEventListener('click', async () => {
    clearTimeout(resetTimer);
    try {
      await navigator.clipboard.writeText(command.textContent.trim());
      label.textContent = 'Copied';
      status.textContent = 'Install command copied to clipboard.';
    } catch {
      label.textContent = 'Select';
      const range = document.createRange();
      range.selectNodeContents(command);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      status.textContent = 'Clipboard unavailable. Command selected; copy it with your keyboard.';
    }
    resetTimer = setTimeout(() => { label.textContent = 'Copy'; }, 2500);
  });
}
