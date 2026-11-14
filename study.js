
(() => {
  const dialog = document.querySelector('.study-dialog');
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href="#study-details"]');
    if (!link) return;
    event.preventDefault();
    dialog.showModal();
  });
  dialog.querySelector('button').addEventListener('click', () => dialog.close());
})();
