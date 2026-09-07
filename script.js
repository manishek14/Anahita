(function () {
        const form = document.getElementById("signupForm");
        if (!form) return;
        form.addEventListener("submit", function (e) {
          e.preventDefault();
          const btn = document.getElementById("submitBtn");
          const isFa = document.documentElement.getAttribute("lang") === "fa";
          btn.innerHTML = isFa
            ? '<span>سپاسگزاریم — به‌زودی جای شما را تأیید می‌کنیم</span><span class="arrow">✓</span>'
            : '<span>thank you — we will confirm your place soon</span><span class="arrow">✓</span>';
          btn.style.background = "var(--terracotta)";
          btn.disabled = true;
          btn.setAttribute("aria-disabled", "true");
          form.querySelector("input,select,textarea").blur();
        });
      })();

(() => {
        const reduceMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;

        /* ─────── Language toggle ─────── */
        const html = document.documentElement;
        const langToggle = document.getElementById("langToggle");
        const langToggleLabel = document.getElementById("langToggleLabel");
        const STORAGE_KEY = "anahita-lang";

        const LANG_LABELS = {
          fa: { self: "فارسی", other: "انگلیسی" },
          en: { self: "English", other: "فارسی" },
        };

        function setLang(lang) {
          if (lang !== "fa" && lang !== "en") lang = "fa";
          html.setAttribute("lang", lang);
          html.setAttribute("dir", lang === "fa" ? "rtl" : "ltr");
          try {
            localStorage.setItem(STORAGE_KEY, lang);
          } catch (e) {}

          // به‌روزرسانی برچسب زبان
          if (langToggleLabel) {
            langToggleLabel.textContent = LANG_LABELS[lang].other;
            langToggle.setAttribute(
              "aria-label",
              lang === "fa" ? "تغییر به انگلیسی" : "تغییر به فارسی",
            );
          }

          // ===== به‌روزرسانی placeholderهای فرم =====
          document
            .querySelectorAll(
              "input[data-placeholder-fa][data-placeholder-en], textarea[data-placeholder-fa][data-placeholder-en]",
            )
            .forEach((el) => {
              const key =
                lang === "fa" ? "data-placeholder-fa" : "data-placeholder-en";
              el.placeholder = el.getAttribute(key);
            });

          // ===== به‌روزرسانی select options =====
          document
            .querySelectorAll("#signupDay option[data-en][data-fa]")
            .forEach((option) => {
              option.textContent = option.dataset[lang] || option.dataset.fa;
            });
        }

        function toggleLang() {
          const cur = html.getAttribute("lang") || "fa";
          setLang(cur === "fa" ? "en" : "fa");
        }

        // Restore saved preference (default: Persian)
        let initialLang = "fa";
        try {
          const saved = localStorage.getItem(STORAGE_KEY);
          if (saved === "en" || saved === "fa") initialLang = saved;
        } catch (e) {}
        setLang(initialLang);

        langToggle.addEventListener("click", toggleLang);

        /* ─────── Fade-up IntersectionObserver ─────── */
        const fadeEls = document.querySelectorAll(".fade-up");
        const fadeObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((e) => {
              if (e.isIntersecting) {
                e.target.classList.add("is-in");
                fadeObserver.unobserve(e.target);
              }
            });
          },
          { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
        );
        fadeEls.forEach((el) => fadeObserver.observe(el));

        document.querySelectorAll(".hero .fade-up").forEach((el) => {
          setTimeout(() => el.classList.add("is-in"), 100);
        });

        /* ─────── Anahita guide phase cycling ─────── */
        const breathLabelFa = document.getElementById("breathLabelFa");
        const breathLabelEn = document.getElementById("breathLabelEn");
        const breathPhaseFa = document.getElementById("breathPhaseFa");
        const breathPhaseEn = document.getElementById("breathPhaseEn");
        const breathGuide = document.getElementById("breathGuide");
        setTimeout(() => breathGuide.classList.add("is-in"), 1200);

        if (!reduceMotion) {
          const startTime = Date.now();
          function tickAnahita() {
            const elapsed = (Date.now() - startTime) / 1000;
            const cycle = elapsed % 8;
            const sec = Math.floor(cycle % 4) + 1;
            const isFa = html.getAttribute("lang") === "fa";
            const phase = cycle < 4 ? "inhale" : "exhale";
            if (isFa) {
              if (breathLabelFa)
                breathLabelFa.textContent =
                  phase === "inhale" ? "دَم" : "بازدم";
              if (breathPhaseFa)
                breathPhaseFa.textContent =
                  "آرام · " + toFaDigits(sec) + " از ۴";
            } else {
              if (breathLabelEn)
                breathLabelEn.textContent =
                  phase === "inhale" ? "Inhale" : "Exhale";
              if (breathPhaseEn)
                breathPhaseEn.textContent = "slow · " + sec + " of 4";
            }
            requestAnimationFrame(tickAnahita);
          }
          tickAnahita();
        }

        function toFaDigits(n) {
          const fa = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
          return String(n).replace(/[0-9]/g, (d) => fa[d]);
        }

        /* ─────── Teacher quote typewriter on hover ─────── */
        document.querySelectorAll(".teacher").forEach((card) => {
          const quoteEl = card.querySelector(".teacher__quote");
          const quoteFa = card.dataset.quoteFa || "";
          const quoteEn = card.dataset.quote || "";
          const fullForCurrentLanguage = () =>
            html.getAttribute("lang") === "fa" ? quoteFa : quoteEn;
          let timer = null;
          let typing = false;

          function clear() {
            if (timer) {
              clearTimeout(timer);
              timer = null;
            }
            typing = false;
            quoteEl.innerHTML = "";
            card.classList.remove("is-typing");
          }

          function type() {
            if (typing) return;
            typing = true;
            card.classList.add("is-typing");
            const full = fullForCurrentLanguage();
            if (!full) return;
            let i = 0;
            quoteEl.innerHTML = "";
            const cursor = document.createElement("span");
            cursor.className = "teacher__quote-cursor";
            quoteEl.appendChild(cursor);

            function step() {
              if (i < full.length && typing) {
                const text = document.createTextNode(full.charAt(i));
                quoteEl.insertBefore(text, cursor);
                i++;
                const ch = full.charAt(i - 1);
                const delay =
                  ch === " "
                    ? 18
                    : ch === ","
                      ? 60
                      : /[\.—]/.test(ch)
                        ? 140
                        : 28;
                timer = setTimeout(step, delay);
              } else {
                setTimeout(() => {
                  if (cursor.parentNode) cursor.remove();
                }, 800);
                typing = false;
              }
            }
            step();
          }

          card.addEventListener("mouseenter", type);
          card.addEventListener("mouseleave", clear);

          card.addEventListener("click", () => {
            if (card.classList.contains("is-typing")) clear();
            else type();
          });
          card.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              if (card.classList.contains("is-typing")) clear();
              else type();
            }
          });
        });

        /* ─────── Schedule row expansion ─────── */
        document.querySelectorAll(".sched-row").forEach((row) => {
          const trigger = row.querySelector(".sched-row__main");
          const toggleRow = () => {
            const wasOpen = row.classList.contains("is-open");
            row.classList.toggle("is-open", !wasOpen);
            if (trigger)
              trigger.setAttribute("aria-expanded", String(!wasOpen));
          };
          row.addEventListener("click", (event) => {
            if (event.target.closest("a, button, input, select, textarea"))
              return;
            toggleRow();
          });
          if (trigger) {
            trigger.addEventListener("keydown", (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                toggleRow();
              }
            });
          }
        });

        /* ─────── Song playback (replaces synthetic chime) ─────── */
        const songAudio = document.getElementById("songAudio");
        const soundToggle = document.getElementById("soundToggle");
        const soundLabel = document.getElementById("soundLabel");
        const soundToast = document.getElementById("soundToast");
        const acceptBtn = document.getElementById("soundAccept");
        const declineBtn = document.getElementById("soundDecline");
        const audioBar = document.getElementById("audioBar");

        let soundEnabled = false;

        function currentLang() {
          return html.getAttribute("lang") || "fa";
        }

        function soundLabelOn() {
          return currentLang() === "fa" ? "صدا · روشن" : "صدا · روشن";
        }
        function soundLabelOff() {
          return currentLang() === "fa" ? "صدا · خاموش" : "صدا · خاموش";
        }

        // Refresh sound label when language changes
        function refreshSoundLabel() {
          const lang = html.getAttribute("lang") || "fa";
          const isOn = soundEnabled;

          if (soundLabel) {
            if (lang === "fa") {
              soundLabel.textContent = isOn ? "صدا · روشن" : "صدا · خاموش";
            } else {
              soundLabel.textContent = isOn ? "Sound · On" : "Sound · Off";
            }
          }
        }
        // Hook into language changes via a MutationObserver on <html lang>
        const langObs = new MutationObserver(refreshSoundLabel);
        langObs.observe(html, { attributes: true, attributeFilter: ["lang"] });

        songAudio.addEventListener("timeupdate", () => {
          if (songAudio.duration) {
            const pct = (songAudio.currentTime / songAudio.duration) * 100;
            audioBar.style.width = pct + "%";
          }
        });
        songAudio.addEventListener("play", () =>
          audioBar.classList.add("is-on"),
        );
        songAudio.addEventListener("pause", () =>
          audioBar.classList.remove("is-on"),
        );
        songAudio.addEventListener("ended", () => {
          audioBar.classList.remove("is-on");
          audioBar.style.width = "0%";
        });

        function enableSound() {
          soundEnabled = true;
          soundToggle.classList.add("is-on");
          refreshSoundLabel();
          soundToast.classList.remove("is-shown");
          songAudio.play().catch((err) => {
            /* autoplay may fail; retry on next user gesture */
          });
        }

        function disableSound() {
          soundEnabled = false;
          soundToggle.classList.remove("is-on");
          refreshSoundLabel();
          songAudio.pause();
        }

        acceptBtn.addEventListener("click", enableSound);
        declineBtn.addEventListener("click", () =>
          soundToast.classList.remove("is-shown"),
        );
        soundToggle.addEventListener("click", () => {
          if (soundEnabled) disableSound();
          else enableSound();
        });

        setTimeout(() => soundToast.classList.add("is-shown"), 2400);
        setTimeout(() => soundToast.classList.remove("is-shown"), 14000);

        /* ─────── Pause hero breath when off-screen ─────── */
        const heroImg = document.querySelector(".hero__img-wrap");
        const heroSection = document.querySelector(".hero");
        if (heroImg && heroSection && !reduceMotion) {
          const heroObs = new IntersectionObserver(
            (entries) => {
              entries.forEach((e) => {
                heroImg.style.animationPlayState = e.isIntersecting
                  ? "running"
                  : "paused";
              });
            },
            { threshold: 0 },
          );
          heroObs.observe(heroSection);
        }

        /* ─────── Topbar subtle condense on scroll ─────── */
        const topbar = document.querySelector(".topbar");
        window.addEventListener(
          "scroll",
          () => {
            const y = window.scrollY;
            if (y > 60) topbar.style.background = "rgba(244, 237, 224, 0.94)";
            else topbar.style.background = "rgba(244, 237, 224, 0.86)";
          },
          { passive: true },
        );

        /* ─────── Smooth anchor scroll with offset ─────── */
        document.querySelectorAll('a[href^="#"]').forEach((a) => {
          a.addEventListener("click", (e) => {
            const id = a.getAttribute("href").slice(1);
            const target = document.getElementById(id);
            if (target) {
              e.preventDefault();
              const y =
                target.getBoundingClientRect().top + window.scrollY - 60;
              window.scrollTo({ top: y, behavior: "smooth" });
            }
          });
        });

        // Initial sound label
        refreshSoundLabel();
      })();
