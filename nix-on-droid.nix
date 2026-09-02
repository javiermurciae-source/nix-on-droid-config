{ pkgs, ... }:
let
  termux-api = pkgs.callPackage ./termux-api.nix { };
in
{
  environment.packages = with pkgs; [
    termux-api
    fish oh-my-posh zoxide eza yazi neovim git gh ripgrep fd findutils
    
    # Reconocimiento & Redes
    exploitdb whatweb tcpdump tshark nmap dnsutils whois
    
    # Android Dev & Reverse Engineering
    jdk17 gradle radare2 frida-tools
    android-tools apksigner
    
    # Document Lab
    typst tectonic pandoc poppler-utils qpdf ghostscript imagemagick
    tesseract unpaper chafa exiftool file fontconfig
    
    # Entretenimiento, Media, Diagnostico & Utilidades
    speedtest-cli nsnake sl glow cmatrix
    yt-dlp ffmpeg-headless aria2 miniserve patchelf gdown
    
    # Entornos Base para IA, Runtimes & Scripts (Web Scraping & Automation)
    nodejs bun glibc
    (python3.withPackages (ps: with ps; [
      requests
      beautifulsoup4
      html2text
      frida-tools
    ]))
  ];

  android-integration.am.enable = true;

  user.shell = "${pkgs.fish}/bin/fish";
  environment.motd = null;
  system.stateVersion = "24.05";
}
