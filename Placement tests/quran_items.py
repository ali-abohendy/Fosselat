# -*- coding: utf-8 -*-
"""
Generates the Qur'an-content questions straight from an authentic Uthmani text
(quran-json 3.1.2, Tanzil source), so every passage is textually exact.

Two families are produced:

  MEMORISATION  — recognition of passages the student claims to have memorised
                  ("which surah is this from", "which passage is from surah X",
                  "both excerpts are from the same surah", similar-surah
                  discrimination). No fill-in-the-blank anywhere.

  APPLIED TAJWEED — a rule applied to a real verse ("which word here is read
                  with qalqalah"), detected from the script's own marks:
                    U+06E1 sukun · U+06E2 iqlab meem · U+0651 shadda
                    U+0653 maddah

Every generated item is checked for answer leakage: a passage that contains the
surah's own name is never used, so the name can't simply be read off the page.
"""
import itertools
import json
import os
import random
import re
import unicodedata

QURAN_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "quran")

SUKUN = "ۡ"      # small high dotless head of khah = sukun in this script
SUKUN2 = "ْ"
IQLAB = "ۢ"      # small high meem = iqlab
SHADDA = "ّ"
MADDAH = "ٓ"
HAMZAS = "ءأإئؤ"
QALQALAH = "قطبجد"
THROAT = "ءأإهعحغخ"            # izhar letters
IDGHAM_L = "يرملون"
IKHFA_L = "تثجدذزسشصضطظفقك"

# Recitation annotation marks (waqf signs, sajdah marks, rub-el-hizb...). They
# carry no phonetic value for a recognition question, and they are missing from
# many system fonts, where they show up as empty boxes. The phonetic marks the
# questions rely on are kept: sukun (06E1), iqlab meem (06E2), small waw/yeh.
DROP_MARKS = dict.fromkeys(
    [0x06D6, 0x06D7, 0x06D8, 0x06D9, 0x06DA, 0x06DB, 0x06DC, 0x06DD, 0x06DE,
     0x06DF, 0x06E0, 0x06E3, 0x06E4, 0x06E7, 0x06E8, 0x06E9, 0x06EA, 0x06EB,
     0x06EC, 0x06ED], None)


# Uthmani-only codepoints are mapped onto the ordinary Arabic block, so the
# text renders in ANY Arabic font instead of showing empty boxes when a
# Qur'anic webfont is unavailable. Only cosmetic/duplicated forms are touched:
# the letters and the harakat a reader needs are all preserved.
# Only two substitutions are made, both exact equivalents in the ordinary
# Arabic block, so no Qur'anic-only glyph is needed for them:
#   alef wasla  ٱ  -> alef ا
#   Uthmani sukun  ۡ  -> standard sukun  ْ
# Everything else in the script is left exactly as revealed; the app loads the
# Amiri Quran webfont, which renders the remaining marks.
MAP_MARKS = {
    0x0671: "ا",
    0x06E1: "\u0652",
}


def clean_text(text):
    """Drop recitation annotations; keep the text itself untouched."""
    return (text or "").translate(DROP_MARKS).translate(MAP_MARKS)


_CACHE = {}


def surah(n):
    if n not in _CACHE:
        with open(os.path.join(QURAN_DIR, f"{n}.json"), encoding="utf-8") as f:
            _CACHE[n] = json.load(f)
    return _CACHE[n]


def name_of(n):
    return surah(n)["transliteration"]


def strip_marks(text):
    out = "".join(c for c in unicodedata.normalize("NFD", text)
                  if unicodedata.category(c) != "Mn" and ord(c) not in (0x670, 0x671))
    return out.replace("ـ", "").replace("ٱ", "ا").replace("أ", "ا").replace("إ", "ا").replace("آ", "ا")


def arabic_name_tokens(n):
    """Words of the surah's Arabic name, for the answer-leakage check."""
    raw = surah(n)["name"]
    toks = []
    for t in strip_marks(raw).split():
        t = t.strip()
        if t.startswith("ال") and len(t) > 3:
            t = t[2:]
        if len(t) >= 3:
            toks.append(t)
    return toks


def leaks(passage, n):
    """True when the passage gives the surah's name away."""
    flat = strip_marks(passage)
    return any(tok in flat for tok in arabic_name_tokens(n))


def verses(n):
    return surah(n)["verses"]


def passage(n, start, count):
    vs = verses(n)
    if start + count > len(vs):
        return None
    return " ".join(v["text"] for v in vs[start:start + count])


def passages_of(n, min_len=38, max_len=190, counts=(1, 2, 3), skip_first=False):
    """All usable excerpts of a surah, as (text, start_index, verse_count)."""
    out = []
    vs = verses(n)
    for c in counts:
        for i in range(len(vs) - c + 1):
            if skip_first and i == 0:
                continue
            t = passage(n, i, c)
            if not t:
                continue
            if not (min_len <= len(t) <= max_len):
                continue
            if leaks(t, n):
                continue
            out.append((clean_text(t), i, c))
    return out


# ---------------------------------------------------------------------------
# Memorisation items
# ---------------------------------------------------------------------------
JUZ30 = list(range(78, 115))
JUZ29 = list(range(67, 78))
KEY_SURAHS = [36, 55, 56, 18]                      # Yaseen, Ar-Rahman, Al-Waqi'ah, Al-Kahf
FIRST_HALF = [2, 3, 4, 5, 6, 7, 10, 11, 12, 14, 16, 17, 18, 19, 20, 21, 23, 24, 25]
SECOND_HALF = [28, 29, 30, 31, 32, 33, 35, 36, 39, 40, 41, 44, 45, 48, 49, 50, 51, 53, 55, 56, 57, 59, 61, 62, 65, 66]

# surahs a child is most likely to have memorised first
KIDS_CORE = list(range(90, 115))   # An-Nas back to Al-Balad

# pairs that genuinely need familiarity to tell apart
SIMILAR_PAIRS = [(113, 114), (108, 110), (105, 106), (102, 104), (91, 92), (93, 94),
                 (99, 100), (81, 82), (69, 70), (73, 74), (67, 68)]

LEVEL_SETS = {
    "kids": {
        1: dict(pool=KIDS_CORE, focus="Juz' Amma"),
        2: dict(pool=JUZ29 + KEY_SURAHS, focus="Juz Tabarak & key surahs"),
        3: dict(pool=FIRST_HALF + KEY_SURAHS, focus="Half of the Qur'an"),
        4: dict(pool=FIRST_HALF + SECOND_HALF, focus="The complete Qur'an"),
    },
    "adults": {
        1: dict(pool=JUZ30, focus="Juz' Amma"),
        2: dict(pool=JUZ29 + KEY_SURAHS, focus="Juz Tabarak & key surahs"),
        3: dict(pool=FIRST_HALF + SECOND_HALF, focus="Half of the Qur'an"),
    },
}


def _distractor_names(correct, pool, rnd, k=3):
    others = [s for s in pool if s != correct]
    rnd.shuffle(others)
    return [name_of(s) for s in others[:k]]


def memorisation_items(audience, level, rnd, target=26):
    """Recognition items for one memorisation level."""
    cfg = LEVEL_SETS[audience][level]
    pool = cfg["pool"]
    kids = audience == "kids"
    counts = (1, 2) if kids else (2, 3)
    max_len = 130 if kids else 200
    items = []
    seen_text = set()

    surahs = pool[:]
    rnd.shuffle(surahs)

    # --- A. "which surah is this passage from?" ----------------------------
    for s in surahs:
        if len([i for i in items if i["kind"] == "A"]) >= target * 0.45:
            break
        cands = passages_of(s, max_len=max_len, counts=counts, skip_first=False)
        if not cands:
            continue
        rnd.shuffle(cands)
        for text, start, c in cands[:2]:
            if text in seen_text:
                continue
            seen_text.add(text)
            opts = [name_of(s)] + _distractor_names(s, pool, rnd)
            rnd.shuffle(opts)
            hard = start > 0 and level >= 3
            items.append(dict(
                kind="A",
                prompt=("Which surah is this from?" if kids else
                        "From which surah is this passage taken?"),
                arabic=text, options=opts, answer=name_of(s),
                skill="Passage Recognition",
                difficulty="hard" if hard else ("easy" if start == 0 and level <= 2 else "medium"),
            ))

    # --- B. "which of these passages is from surah X?" ---------------------
    for s in surahs:
        if len([i for i in items if i["kind"] == "B"]) >= target * 0.25:
            break
        right = passages_of(s, max_len=max_len, counts=(1,) if kids else (1, 2))
        if not right:
            continue
        correct = rnd.choice(right)[0]
        target_len = len(correct)
        others = [o for o in pool if o != s]
        rnd.shuffle(others)
        wrongs = []
        for o in others:
            cand = [c for c in passages_of(o, max_len=max_len, counts=(1,) if kids else (1, 2))
                    if 0.75 * target_len <= len(c[0]) <= 1.3 * target_len]
            if cand:
                wrongs.append(rnd.choice(cand)[0])
            if len(wrongs) == 3:
                break
        if len(wrongs) < 3:
            continue
        if correct in seen_text:
            continue
        seen_text.add(correct)
        opts = [correct] + wrongs
        rnd.shuffle(opts)
        items.append(dict(
            kind="B",
            prompt=f"Which of these is from Surah {name_of(s)}?",
            arabic=None, options=opts, answer=correct,
            skill="Passage Recognition", difficulty="medium",
            options_arabic=True,
        ))

    # --- C. two excerpts from the same surah -------------------------------
    for s in surahs:
        if len([i for i in items if i["kind"] == "C"]) >= target * 0.15:
            break
        cands = passages_of(s, max_len=110, counts=(1,))
        if len(cands) < 4:
            continue
        a, b = cands[0][0], cands[-1][0]
        if a == b or a in seen_text:
            continue
        seen_text.add(a)
        opts = [name_of(s)] + _distractor_names(s, pool, rnd)
        rnd.shuffle(opts)
        items.append(dict(
            kind="C",
            prompt=("Both lines below are from the same surah. Which one?" if kids else
                    "Both excerpts below come from the same surah. Which surah is it?"),
            arabic=a + "\n" + b, options=opts, answer=name_of(s),
            skill="Surah Familiarity", difficulty="hard",
        ))

    # --- D. similar-surah discrimination -----------------------------------
    for a, b in SIMILAR_PAIRS:
        if a not in pool or b not in pool:
            continue
        if len([i for i in items if i["kind"] == "D"]) >= target * 0.15:
            break
        ca = passages_of(a, max_len=110, counts=(1,))
        cb = passages_of(b, max_len=110, counts=(1,))
        if len(ca) < 2 or len(cb) < 2:
            continue
        correct = rnd.choice(ca)[0]
        if correct in seen_text:
            continue
        seen_text.add(correct)
        pool_b = sorted((t for t, _, _ in cb), key=lambda t: abs(len(t) - len(correct)))
        pool_a = sorted((t for t, _, _ in ca if t != correct), key=lambda t: abs(len(t) - len(correct)))
        opts = [correct] + pool_b[:2] + pool_a[:1]
        if len(opts) < 4 or max(map(len, opts)) > 2.0 * min(map(len, opts)):
            continue
        opts = list(dict.fromkeys(opts))
        if len(opts) < 4:
            continue
        rnd.shuffle(opts)
        items.append(dict(
            kind="D",
            prompt=f"Which of these is from Surah {name_of(a)}, and not from Surah {name_of(b)}?",
            arabic=None, options=opts[:4], answer=correct,
            skill="Passage Discrimination", difficulty="hard",
            options_arabic=True,
        ))

    items = [i for i in items if len(set(i["options"])) == len(i["options"])]
    rnd.shuffle(items)
    return items[:target]


# ---------------------------------------------------------------------------
# Applied tajweed items, detected from the script itself
# ---------------------------------------------------------------------------
def has_qalqalah(word):
    return bool(re.search("[" + QALQALAH + "][" + SUKUN + SUKUN2 + "]", word))


def has_iqlab(word):
    return IQLAB in word


def has_madd_muttasil(word):
    """A madd letter carrying the maddah sign, with a hamza in the same word."""
    if MADDAH not in word:
        return False
    i = word.index(MADDAH)
    return any(h in word[i:] for h in HAMZAS)


def has_sun_lam(word):
    """al- followed by a doubled letter: the laam is silent (a sun letter)."""
    return bool(re.match("^[وفبكل]?[ٱا]ل[^" + SHADDA + "]" + SHADDA, word))


def has_moon_lam(word):
    return bool(re.match("^[وفبكل]?[ٱا]ل", word)) and not has_sun_lam(word)


def bare_final_nun(word):
    """Word ending in a noon with no vowel mark of its own (noon sakinah)."""
    return bool(re.match(r"^.*ن$", word))


def clean_word(w):
    return w.strip("۝ ۞ ")


def verse_words(text):
    return [clean_word(w) for w in text.split() if clean_word(w)]


def _rule_item(prompt, verse, options, answer, skill, difficulty):
    return dict(kind="T", prompt=prompt, arabic=clean_text(verse),
                options=[clean_text(o) for o in options], answer=clean_text(answer),
                skill=skill, difficulty=difficulty, options_arabic=True)


def tajweed_items(surah_range, rnd, target=24, kids=False):
    """Applied-rule items built from real verses."""
    items = []
    seen = set()
    order = list(surah_range)
    rnd.shuffle(order)

    def add_word_item(v, hit, others, prompt, skill, difficulty):
        if hit in seen or len(others) < 3:
            return False
        # Balance the option lengths: of the nearest candidates, take the trio
        # whose average length sits closest to the answer's, so nobody can learn
        # "the longest word is the answer".
        near = sorted(set(others), key=lambda w: (abs(len(w) - len(hit)), w))[:8]
        if len(near) < 3:
            return False
        best, best_gap = None, None
        for combo in itertools.combinations(near, 3):
            gap = abs(sum(len(w) for w in combo) / 3 - len(hit))
            if best_gap is None or gap < best_gap:
                best, best_gap = combo, gap
        if best_gap is not None and best_gap > 2.5:
            return False
        picks = list(best)
        seen.add(hit)
        opts = [hit] + picks
        rnd.shuffle(opts)
        items.append(_rule_item(prompt, v, opts, hit, skill, difficulty))
        return True

    for s in order:
        for v in verses(s):
            t = v["text"]
            if not (40 <= len(t) <= 150):
                continue
            words = verse_words(t)
            if len(words) < 5:
                continue

            # qalqalah
            q = [w for w in words if has_qalqalah(w)]
            # the last word of a verse is read with a stop, which gives its own
            # qalqalah if it ends in one of the five letters - never a distractor
            last = words[-1]
            rest = [w for w in words if not has_qalqalah(w) and len(w) > 3
                    and not (w is last and strip_marks(w)[-1:] in list(QALQALAH))]
            if len(q) == 1 and len(rest) >= 3 and len(items) < target:
                add_word_item(t, q[0], rest,
                              "Which word in this verse is read with Qalqalah?" if not kids
                              else "Which word here has a Qalqalah bounce?",
                              "Tajweed in Context", "medium")

            # iqlab
            iq = [w for w in words if has_iqlab(w)]
            rest = [w for w in words if not has_iqlab(w) and len(w) > 3]
            if len(iq) == 1 and len(rest) >= 3 and len(items) < target:
                add_word_item(t, iq[0], rest,
                              "In which word is the noon read as a meem sound (Iqlab)?",
                              "Tajweed in Context", "hard")

            # madd muttasil
            md = [w for w in words if has_madd_muttasil(w)]
            rest = [w for w in words if not has_madd_muttasil(w) and MADDAH not in w and len(w) > 3]
            if len(md) == 1 and len(rest) >= 3 and len(items) < target:
                add_word_item(t, md[0], rest,
                              "Which word contains a connected Madd (Madd Muttasil)?",
                              "Madd", "hard")

            # sun letter: the laam of "al-" is not pronounced
            sun = [w for w in words if has_sun_lam(w)]
            moon = [w for w in words if has_moon_lam(w) and len(w) > 3]
            if len(sun) == 1 and len(moon) >= 3 and len(items) < target:
                add_word_item(t, sun[0], moon,
                              "In which word is the Laam of 'al-' NOT pronounced (a sun letter)?"
                              if not kids else
                              "In which word do we not say the 'l' of 'al-'?",
                              "Reading Accuracy", "medium")
        if len(items) >= target:
            break

    items = [i for i in items if len(set(i["options"])) == len(i["options"])]
    rnd.shuffle(items)
    return items[:target]


# ---------------------------------------------------------------------------
def build(seed=20260812):
    """Everything the question bank needs from the Qur'an text."""
    out = {"memorisation": {}, "tajweed": {}}
    for audience, levels in LEVEL_SETS.items():
        out["memorisation"][audience] = {}
        for level in levels:
            rnd = random.Random(f"{seed}-mem-{audience}-{level}")
            out["memorisation"][audience][level] = memorisation_items(audience, level, rnd)
    out["tajweed"]["juz30"] = tajweed_items(range(78, 115), random.Random(f"{seed}-t30"), 26)
    out["tajweed"]["juz30-kids"] = tajweed_items(range(93, 115), random.Random(f"{seed}-t30k"), 20, kids=True)
    out["tajweed"]["wide"] = tajweed_items(list(range(1, 30)) + list(range(36, 78)),
                                           random.Random(f"{seed}-tw"), 26)
    return out


if __name__ == "__main__":
    data = build()
    for aud, levels in data["memorisation"].items():
        for lvl, items in levels.items():
            kinds = {}
            for i in items:
                kinds[i["kind"]] = kinds.get(i["kind"], 0) + 1
            print(f"mem {aud} L{lvl}: {len(items)} items {kinds}")
    for k, v in data["tajweed"].items():
        print(f"tajweed {k}: {len(v)} items")
    print("\nSAMPLES")
    for i in data["memorisation"]["adults"][1][:3]:
        print("-", i["prompt"], "|", (i["arabic"] or "")[:70], "|", i["options"][:2], "=>", i["answer"])
    for i in data["tajweed"]["juz30"][:3]:
        print("-", i["prompt"], "|", i["arabic"][:60], "| opts", i["options"], "=>", i["answer"])
