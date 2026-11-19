(() => {
  function activate(tab, focus) {
    const widget = tab.closest('[data-tools-explorer]');
    if (!widget) return;
    widget.querySelectorAll('[role="tab"]').forEach(item => {
      const selected = item === tab;
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
      const panel = widget.querySelector('#' + item.getAttribute('aria-controls'));
      if (panel) panel.hidden = !selected;
    });
    if (focus) tab.focus();
  }
  document.addEventListener('click', event => {
    const tab = event.target.closest('[data-tools-explorer] [role="tab"]');
    if (tab) activate(tab, false);
  });
  document.addEventListener('keydown', event => {
    const tab = event.target.closest('[data-tools-explorer] [role="tab"]');
    if (!tab) return;
    const tabs = [...tab.closest('[role="tablist"]').querySelectorAll('[role="tab"]')];
    const current = tabs.indexOf(tab);
    let next;
    if (event.key === 'ArrowRight') next = (current + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') next = (current - 1 + tabs.length) % tabs.length;
    else if (event.key === 'ArrowDown') next = (current + 2) % tabs.length;
    else if (event.key === 'ArrowUp') next = (current - 2 + tabs.length) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    else return;
    event.preventDefault();
    activate(tabs[next], true);
  });
})();
