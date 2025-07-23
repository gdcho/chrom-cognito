document.addEventListener("contextmenu", (e) => {
  if ((e.metaKey && e.shiftKey) || (e.ctrlKey && e.shiftKey)) {
    const link = (e.target as HTMLElement).closest(
      "a",
    ) as HTMLAnchorElement | null;
    const url = link?.href ?? window.location.href;
    chrome.runtime.sendMessage({ type: "OPEN_WITH_MODIFIER", url });
    e.preventDefault();
  }
});
