{ pkgs, home-manager, ... }:
let
  termux-api = pkgs.callPackage ./termux-api.nix { };
in
{
  environment.packages = with pkgs; [
    termux-api
    home-manager.packages.${pkgs.system}.default
    fish oh-my-posh zoxide eza yazi neovim fastfetch git gh ripgrep fd findutils gnugrep tree
    
    # Reconocimiento & Redes
    exploitdb whatweb tcpdump tshark nmap dnsutils whois tailscale
    
    # Android Dev & Reverse Engineering
    jdk17 gradle radare2 frida-tools
    android-tools apksigner
    
    # Document Lab
    typst tectonic pandoc poppler-utils qpdf ghostscript imagemagick
    tesseract unpaper chafa exiftool file fontconfig
    
    # Entretenimiento, Media, Diagnostico & Utilidades
    speedtest-cli nsnake sl glow cmatrix cowsay
    yt-dlp ffmpeg-headless aria2 miniserve patchelf gdown
    
    # Entornos Base para IA, Runtimes & Scripts (Web Scraping & Automation)
    opencode
    nodejs bun glibc
    (python3.withPackages (ps: with ps; [
      requests
      beautifulsoup4
      html2text
      frida-tools
    ]))
  ];

  android-integration.am.enable = true;

  time.timeZone = "America/Bogota";

  user.shell = "${pkgs.fish}/bin/fish";
  environment.motd = null;
  system.stateVersion = "24.05";

  # Integración oficial con Home Manager
  home-manager = {
    useGlobalPkgs = true;
    useUserPackages = true;
    backupFileExtension = "bak";
    config = ./home.nix;
  };
}
