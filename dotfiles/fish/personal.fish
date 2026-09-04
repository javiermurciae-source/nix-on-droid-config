# === Personal ===
set -q TZ; or set -gx TZ America/Bogota
# Prompt: una sola flecha
function fish_prompt
    set -l s $status
    set_color blue
    printf '%s ' (prompt_pwd)
    if test $s -eq 0
        set_color green
    else
        set_color red
    end
    printf '❯ '
    set_color normal
end

# Eza (reemplaza ls). En este Android eza necesita el dir explícito: `.` por defecto.
if type -q eza
    function ls --wraps=eza
        if test (count $argv) -eq 0
            eza .
        else
            eza $argv
        end
    end
    function ll --wraps=eza
        if test (count $argv) -eq 0
            eza -l --group-directories-first .
        else
            eza -l --group-directories-first $argv
        end
    end
    function la --wraps=eza
        if test (count $argv) -eq 0
            eza -la --group-directories-first .
        else
            eza -la --group-directories-first $argv
        end
    end
    function lt --wraps=eza
        if test (count $argv) -eq 0
            eza --tree --group-directories-first .
        else
            eza --tree --group-directories-first $argv
        end
    end
    function l --wraps=eza
        if test (count $argv) -eq 0
            eza -la .
        else
            eza -la $argv
        end
    end
else
    alias ll='ls -la'
end
alias ..='cd ..'
alias cls='clear'

# Scripts & Launcher
alias agy='agy --dangerously-skip-permissions'
alias horario='bash ~/horario.sh'
alias hor='bash ~/horario.sh'
alias tren='sl'

# Termux Launcher App Shortcuts
function app --description "Abrir aplicación en Android usando launcherctl"
    launcherctl launch $argv
end
alias openapp='launcherctl launch'
alias wapp='launcherctl launch whatsapp'
alias ytb='launcherctl launch youtube'
alias sett='launcherctl launch settings'
alias gal='launcherctl launch gallery'
alias chrome='launcherctl launch chrome'

# Storage & Android Files Shortcuts
alias storage='cd ~/storage/shared'
alias sdown='cd ~/storage/downloads'
alias sdcim='cd ~/storage/dcim'
alias spics='cd ~/storage/pictures'
alias smusic='cd ~/storage/music'
alias smovies='cd ~/storage/movies'
alias sdocs='cd ~/storage/documents'
alias yz='yazi ~/storage/shared'

# Root & Shizuku
function su --description "Ejecutar comando o shell como root en Android vía Shizuku"
    if test (count $argv) -eq 0
        $HOME/bin/rish
    else if test "$argv[1]" = "-c"
        $HOME/bin/rish $argv
    else
        $HOME/bin/rish -c "$argv"
    end
end

function sudo --description "Ejecutar comando como root en Android vía Shizuku"
    $HOME/bin/rish -c "$argv"
end

alias s='sudo'
alias adbs='adb shell'
alias adbd='adb devices'
alias adbc='adb connect 127.0.0.1:5555'

# Capturas de pantalla
function shot --description "Tomar captura de pantalla en Android"
    set -l dest "$HOME/storage/pictures/shot_"(date +%Y%m%d_%H%M%S)".png"
    $HOME/bin/rish -c "/system/bin/screencap -p $dest"
    echo "Captura guardada en: $dest"
end
alias screenshot='shot'

# Herramientas
alias codc='bash ~/verificar-cod.sh'
alias verificar-cod='bash ~/verificar-cod.sh'
alias sploit='searchsploit'

# Tailscale / Remoto
alias tsstatus='curl -s --connect-timeout 3 http://cachyos-x8664:8081/ >/dev/null 2>&1 && echo "PC: Online" || echo "PC: Offline"'
alias tspc='ssh -o ConnectTimeout=5 rootkit@cachyos-x8664'

fish_add_path --move --prepend $HOME/bin $HOME/.nix-profile/bin $HOME/.local/bin
if test -d $HOME/.nix-profile/lib/openjdk
    set -gx JAVA_HOME $HOME/.nix-profile/lib/openjdk
else if test -n "$PREFIX" -a -d "$PREFIX"
    set -gx JAVA_HOME $PREFIX
end

# Kitten (Kitty features)
alias kicat='kitten icat'
alias kssh='kitten ssh rootkit@cachyos-x8664'
alias ktransfer='kitten transfer'
alias kdiff='kitten diff'
alias kclip='kitten clipboard'
alias knotify='kitten notify'
fish_add_path ~/.npm-global/bin
