(function () {
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
  document.querySelector('.menu-toggle')?.addEventListener('click', function () {
    document.body.classList.toggle('menu-open');
  });
})();
