{ pkgs, config, lib, ... }:

{
  # Versión de estado de Home Manager
  home.stateVersion = "24.05";
  home.enableNixpkgsReleaseCheck = false;

  # CLI de Home Manager disponible directamente en la terminal (comando `home-manager`)
  programs.home-manager.enable = true;

  # 1. Enlazar ~/bin con ejecutables, wrappers de IA y Shizuku
  home.file."bin" = {
    source = ./bin;
    recursive = true;
  };

  # 2. Enlazar scripts utilitarios al raíz ~/
  home.file."horario.sh" = {
    source = ./scripts/horario.sh;
    executable = true;
  };

  home.file."verificar-cod.sh" = {
    source = ./scripts/verificar-cod.sh;
    executable = true;
  };

  home.file."install-ai-tools.sh" = {
    source = ./scripts/install-ai-tools.sh;
    executable = true;
  };

  # 3. Reglas de agentes y asistentes
  home.file."AGENTS.md".source = ./AGENTS.md;
  home.file."GEMINI.md".source = ./GEMINI.md;

  # 4. Dotfiles en ~/.config/ (XDG Config Home)
  xdg.configFile."fastfetch".source = ./dotfiles/fastfetch;
  xdg.configFile."yazi/yazi.toml".source = ./dotfiles/yazi/yazi.toml;

  # 5. Configuración declarativa de Fish Shell
  programs.fish = {
    enable = true;
    # Desactivar saludo de bienvenida 'Welcome to fish...'
    shellInit = ''
      set -g fish_greeting ""
      function fish_greeting; end
      # Cargar personal.fish versionado en el repositorio
      source ${./dotfiles/fish/personal.fish}
    '';
  };
}
