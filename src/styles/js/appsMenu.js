class appsMenu {
  constructor() {
    this.appsMenu = document.getElementById('appsMenu');
    this.menuButton = document.getElementById('menu_apps');
    this.init();
  }

  init() {
    this.menuButton.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleAppsMenu();
    });

    this.appsMenu.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    document.addEventListener('click', () => {
      this.closeAppsMenu();
    });
  }

  toggleAppsMenu() {
    this.appsMenu.classList.toggle('hidden');
  }

  closeAppsMenu() {
    this.appsMenu.classList.add('hidden');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window._os = new appsMenu();
});
