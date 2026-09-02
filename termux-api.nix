{ pkgs }:

pkgs.stdenv.mkDerivation rec {
  pname = "termux-api";
  version = "0.59.1";

  src = pkgs.fetchFromGitHub {
    owner = "PickleHik3";
    repo = "termux-api-package";
    rev = "master";
    sha256 = "179paxjzihlpwxgh6wkxnvm1w3claxpjmgr66ablzxhkxws97fs3";
  };

  nativeBuildInputs = [ pkgs.cmake pkgs.makeWrapper ];
  cmakeFlags = [ "-DCMAKE_POLICY_VERSION_MINIMUM=3.5" ];

  postPatch = ''
    substituteInPlace scripts/*.in termux-callback.in \
      --replace-quiet "@TERMUX_PREFIX@/bin/sh" "${pkgs.runtimeShell}" \
      --replace-quiet "@TERMUX_PREFIX@/bin/bash" "${pkgs.bash}/bin/bash" \
      --replace-quiet "com.termux.api/.KeepAliveService" "com.termux.launcher.nix.api/com.termux.api.KeepAliveService" \
      --replace-quiet "am " "termux-am "

    substituteInPlace termux-api.c \
      --replace-fail 'execv(PREFIX "/bin/am", child_argv);' 'execvp("termux-am", child_argv); execvp("am", child_argv);' \
      --replace-quiet 'com.termux.api://listen' 'com.termux.launcher.nix.api://listen' \
      --replace-quiet 'com.termux.api/.TermuxApiReceiver' 'com.termux.launcher.nix.api/com.termux.api.TermuxApiReceiver'
  '';

  postInstall = ''
    for f in $out/bin/* $out/libexec/*; do
      if [ -f "$f" ] && [ -x "$f" ]; then
        wrapProgram "$f" \
          --prefix PATH : ${pkgs.lib.makeBinPath [ pkgs.util-linux pkgs.coreutils pkgs.gnused pkgs.gnugrep pkgs.jq ]}:/data/data/com.termux.launcher.nix/files/home/.nix-profile/bin
      fi
    done
  '';
}
