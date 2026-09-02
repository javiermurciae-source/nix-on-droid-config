# === Personal ===
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

# Scripts
alias horario='bash ~/horario.sh'
alias hor='bash ~/horario.sh'
alias tren='sl'

# Root & ADB
function su --description "Ejecutar comando o shell como root en Android"
    /android/system/bin/su $argv
end

function sudo --description "Ejecutar comando como root en Android"
    /android/system/bin/su -c "$argv"
end

alias s='sudo'
alias adbs='adb shell'
alias adbd='adb devices'

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
