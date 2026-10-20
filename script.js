(function () {
    var cur = "0", prev = null, op = null, fresh = false, err = false, history = [];
    var SYM = { "+": "+", "-": "−", "*": "×", "/": "÷" };
    var $v = document.getElementById("value");
    var $e = document.getElementById("expr");
    var $h = document.getElementById("hist");

    function fmt(s) {
        if (err) return s;
        var neg = s[0] === "-", t = neg ? s.slice(1) : s;
        var parts = t.split("."), i = parts[0];
        if (/^\d+$/.test(i)) i = Number(i).toLocaleString("en-IN");
        return (neg ? "-" : "") + i + (parts.length > 1 ? "." + parts[1] : "");
    }
    function clean(n) {
        var r = parseFloat(n.toPrecision(12));
        return String(r);
    }
    function calc(a, b, o) {
        a = parseFloat(a); b = parseFloat(b);
        if (o === "+") return a + b;
        if (o === "-") return a - b;
        if (o === "*") return a * b;
        if (o === "/") return b === 0 ? null : a / b;
    }
    function render() {
        $v.textContent = fmt(cur);
        $v.className = "value" + (err ? " err" : "");
        $e.textContent = op && prev !== null ? fmt(prev) + " " + SYM[op] : "";
        document.querySelectorAll("button.op").forEach(function (b) {
            b.classList.toggle("on", b.dataset.v === op && fresh && prev !== null);
        });
    }
    function renderHist() {
        $h.innerHTML = "";
        if (!history.length) {
            var li = document.createElement("li");
            li.className = "empty"; li.textContent = "Your calculations will show up here.";
            $h.appendChild(li); return;
        }
        history.slice().reverse().forEach(function (h) {
            var li = document.createElement("li");
            var a = document.createElement("span"), b = document.createElement("span");
            a.textContent = h.text; b.textContent = fmt(h.result);
            li.appendChild(a); li.appendChild(b);
            li.title = "Use this result";
            li.onclick = function () { err = false; cur = h.result; fresh = true; prev = null; op = null; render(); };
            $h.appendChild(li);
        });
    }
    function showErr(msg) { err = true; cur = msg; prev = null; op = null; fresh = true; }
    function reset() { cur = "0"; prev = null; op = null; fresh = false; err = false; }

    function num(d) {
        if (err) reset();
        if (fresh) { cur = "0"; fresh = false; }
        if (cur === "0") cur = d;
        else if (cur.replace(/[-.]/g, "").length < 15) cur += d;
    }
    function dot() {
        if (err) reset();
        if (fresh) { cur = "0"; fresh = false; }
        if (cur.indexOf(".") === -1) cur += ".";
    }
    function setOp(o) {
        if (err) return;
        if (op && prev !== null && !fresh) {
            var r = calc(prev, cur, op);
            if (r === null) { showErr("Zero se divide nahi hota"); return; }
            cur = clean(r);
        }
        prev = cur; op = o; fresh = true;
    }
    function eq() {
        if (err || !op || prev === null) return;
        var r = calc(prev, cur, op);
        if (r === null) { showErr("Zero se divide nahi hota"); return; }
        var res = clean(r);
        history.push({ text: fmt(prev) + " " + SYM[op] + " " + fmt(cur), result: res });
        if (history.length > 10) history.shift();
        cur = res; prev = null; op = null; fresh = true;
        renderHist();
    }
    function back() {
        if (err) { reset(); return; }
        if (fresh) return;
        cur = cur.length > 1 && !(cur.length === 2 && cur[0] === "-") ? cur.slice(0, -1) : "0";
    }
    function percent() {
        if (err) return;
        cur = clean(parseFloat(cur) / 100); fresh = true;
    }

    function act(a, v) {
        if (a === "num") num(v);
        else if (a === "dot") dot();
        else if (a === "op") setOp(v);
        else if (a === "eq") eq();
        else if (a === "clear") reset();
        else if (a === "back") back();
        else if (a === "percent") percent();
        render();
    }

    document.getElementById("keys").addEventListener("click", function (e) {
        var b = e.target.closest("button");
        if (b) act(b.dataset.a, b.dataset.v);
    });
    document.addEventListener("keydown", function (e) {
        var k = e.key;
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        if (/^\d$/.test(k)) act("num", k);
        else if (k === ".") act("dot");
        else if ("+-*/".indexOf(k) > -1) act("op", k);
        else if (k === "Enter" || k === "=") { e.preventDefault(); act("eq"); }
        else if (k === "Backspace") act("back");
        else if (k === "Escape" || k === "c" || k === "C") act("clear");
        else if (k === "%") act("percent");
    });
    document.getElementById("clearHist").onclick = function () { history = []; renderHist(); };
    document.getElementById("theme").onclick = function () {
        var r = document.documentElement;
        var dark = r.dataset.theme ? r.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
        r.dataset.theme = dark ? "light" : "dark";
    };

    render(); renderHist();
})();
