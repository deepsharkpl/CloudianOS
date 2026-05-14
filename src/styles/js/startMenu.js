class startMenu {
  constructor() {
    this.startMenu = document.getElementById('startMenu');
    this.menuButton = document.getElementById('menu');
    this.init();
  }

  init() {
    this.menuButton.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleStartMenu();
    });

    this.startMenu.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    document.addEventListener('click', () => {
      this.closeStartMenu();
    });
  }

  toggleStartMenu() {
    this.startMenu.classList.toggle('hidden');
  }

  closeStartMenu() {
    this.startMenu.classList.add('hidden');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window._os = new startMenu();
});
