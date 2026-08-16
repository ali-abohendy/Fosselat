# -*- coding: utf-8 -*-
"""
Assembles the question bank for every program.

Sources
  pool_read.py      hand-written reading / tajweed / ijazah items
  pool_arabic.py    hand-written Arabic Foundation and Post-Foundation items
  pool_isl_*.py     Islamic Studies items
  quran_items.py    items generated from an authentic Uthmani Qur'an text
                    (memorisation recognition, and tajweed applied to real verses)

A program is described either by STAGES (pools of items mapped onto the
audience's levels) or, for memorisation, by per-level generated banks.
"""
import pool_read as R
import pool_arabic as A
import pool_isl_comp as IC
import pool_isl_afh as AFH
import pool_isl_stm as STM
import pool_isl_topup as TOP
import quran_items


# ---------------------------------------------------------------------------
def _conv(gen):
    """Generated item -> the same shape as a hand-written one."""
    opts = gen["options"]
    return dict(skill=gen["skill"], difficulty=gen["difficulty"], prompt=gen["prompt"],
                options=opts, correct=opts.index(gen["answer"]), audience="both",
                arabic=gen.get("arabic"), options_arabic=bool(gen.get("options_arabic")))


QURAN = quran_items.build()
MEM = {aud: {lvl: [_conv(i) for i in items] for lvl, items in levels.items()}
       for aud, levels in QURAN["memorisation"].items()}
TAJ30 = [_conv(i) for i in QURAN["tajweed"]["juz30"]]
TAJ30K = [_conv(i) for i in QURAN["tajweed"]["juz30-kids"]]
TAJW = [_conv(i) for i in QURAN["tajweed"]["wide"]]


def _kids(items, existing=()):
    """Kids-worded variants, minus anything already present in the pool."""
    seen = {(i["prompt"], i.get("arabic"), tuple(sorted(i["options"]))) for i in existing}
    out = []
    for i in items:
        key = (i["prompt"], i.get("arabic"), tuple(sorted(i["options"])))
        if key in seen:
            continue
        seen.add(key)
        out.append(dict(i, audience="kids"))
    return out


def top(name, base):
    return base + TOP.EXTRAS.get(name, [])


# ===========================================================================
READING_TAJWEED = {
    "id": "reading-tajweed",
    "prefix": "QURAN_READ",
    "stages": {
        "S1": {"focus": "Letters & Sounds", "questions": R.QT_S1},
        "S2": {"focus": "Short Vowels & Word Reading", "questions": R.QT_S2},
        "S3": {"focus": "Reading Verses & Core Tajweed", "questions": R.QT_S3 + TAJ30 + _kids(TAJ30K, R.QT_S3 + TAJ30)},
        "S4": {"focus": "Advanced Tajweed & Stopping", "questions": R.QT_S4 + TAJW},
    },
    "levelStages": {
        "kids": {1: ["S1"], 2: ["S2"], 3: ["S3"], 4: ["S4"]},
        "adults": {1: ["S1", "S2"], 2: ["S3"], 3: ["S4"]},
    },
    "selfReport": {
        "kids": {
            "prompt": "First, tell us about yourself: how well can you read the Qur'an right now?",
            "options": [("I am just starting — I don't know the letters yet", 1),
                        ("I know the letters and can read short words", 2),
                        ("I can read verses on my own", 3),
                        ("I read well and know Tajweed rules", 4)],
        },
        "adults": {
            "prompt": "First, tell us about yourself: how would you describe your Qur'an reading right now?",
            "options": [("I am a complete beginner — I don't know the Arabic letters yet", 1),
                        ("I know the letters and can read simple words", 1),
                        ("I can read verses fairly fluently", 2),
                        ("I read fluently and know the Tajweed rules well", 3)],
        },
    },
}

MEMORIZATION = {
    "id": "memorization",
    "prefix": "QURAN_MEM",
    "generated": MEM,
    "levelFocus": {
        "kids": {1: "Juz' Amma", 2: "Juz Tabarak & key surahs", 3: "Half of the Qur'an", 4: "The complete Qur'an"},
        "adults": {1: "Juz' Amma", 2: "Juz Tabarak & key surahs", 3: "Half of the Qur'an"},
    },
    "selfReport": {
        "kids": {
            "prompt": "First, tell us about yourself: how much of the Qur'an have you memorised so far?",
            "options": [("A few short surahs", 1), ("Juz' Amma (Juz 30)", 1),
                        ("Juz' Amma and Juz Tabarak, or other surahs too", 2),
                        ("About half of the Qur'an", 3), ("Most or all of the Qur'an", 4)],
        },
        "adults": {
            "prompt": "First, tell us about yourself: what is the highest amount of Qur'an you have memorised?",
            "options": [("A few short surahs", 1), ("Juz' Amma (Juz 30)", 1),
                        ("Juz' Amma plus Juz Tabarak / additional surahs", 2),
                        ("Approximately half of the Qur'an", 3), ("Most or all of the Qur'an", 3)],
        },
    },
}

IJAZAH = {
    "id": "ijazah",
    "prefix": "QURAN_IJZ",
    "stages": {
        "S1": {"focus": "Advanced Tajweed & Makharij", "questions": R.QI_S1 + TAJW},
        "S2": {"focus": "Ijazah Readiness & Correction", "questions": R.QI_S2 + R.QT_S4},
    },
    "levelStages": {"kids": {1: ["S1"], 2: ["S2"]}, "adults": {1: ["S1"], 2: ["S2"]}},
    "selfReport": {
        "kids": {"prompt": "First, tell us about yourself: how far have you studied Tajweed?",
                 "options": [("I read well but I am still learning the Tajweed rules", 1),
                             ("I have studied Tajweed in depth and recite very precisely", 2)]},
        "adults": {"prompt": "First, tell us about yourself: how far have you studied Tajweed?",
                   "options": [("I recite fluently but I am still building my Tajweed theory", 1),
                               ("I have studied Tajweed in depth and recite with precision", 2)]},
    },
}

ARABIC_FOUNDATION = {
    "id": "foundation",
    "prefix": "ARB_FND",
    "stages": {
        "S1": {"focus": "Arabic Letters", "questions": A.AF_S1},
        "S2": {"focus": "Short Vowels & Joining Letters", "questions": A.AF_S2},
        "S3": {"focus": "Reading Words", "questions": A.AF_S3},
        "S4": {"focus": "Short Sentences & Everyday Arabic", "questions": A.AF_S4},
    },
    "levelStages": {
        "kids": {1: ["S1"], 2: ["S2"], 3: ["S3"], 4: ["S4"]},
        "adults": {1: ["S1", "S2"], 2: ["S3"], 3: ["S4"]},
    },
    "selfReport": {
        "kids": {"prompt": "First, tell us about yourself: how much Arabic can you read right now?",
                 "options": [("I don't know the Arabic letters yet", 1),
                             ("I know the letters and the vowel marks", 2),
                             ("I can read simple words", 3),
                             ("I can read short sentences", 4)]},
        "adults": {"prompt": "First, tell us about yourself: how much Arabic can you read right now?",
                   "options": [("I cannot read the Arabic letters yet", 1),
                               ("I know the letters and the short vowels", 1),
                               ("I can read simple words", 2),
                               ("I can read short sentences comfortably", 3)]},
    },
}

ARABIC_ADVANCED = {
    "id": "advanced",
    "prefix": "ARB_PF",
    "stages": {
        "S1": {"focus": "Everyday Vocabulary & Exchanges", "questions": A.AA_S1},
        "S2": {"focus": "Verbs & Sentence Building", "questions": A.AA_S2},
        "S3": {"focus": "Grammar & Reading Comprehension", "questions": A.AA_S3},
        "S4": {"focus": "Advanced Reading & Expression", "questions": A.AA_S4},
    },
    "levelStages": {
        "kids": {1: ["S1"], 2: ["S2"], 3: ["S3"], 4: ["S4"]},
        "adults": {1: ["S1"], 2: ["S2"], 3: ["S3"], 4: ["S4"]},
    },
    "selfReport": {
        "kids": {"prompt": "First, tell us about yourself: how much Arabic can you use right now?",
                 "options": [("I know a few words and greetings", 1), ("I can make simple sentences", 2),
                             ("I can read short paragraphs and use different tenses", 3),
                             ("I can read and talk about longer texts", 4)]},
        "adults": {"prompt": "First, tell us about yourself: how would you describe your Arabic right now?",
                   "options": [("I know everyday words and basic greetings", 1),
                               ("I can build simple sentences and use the present tense", 2),
                               ("I can handle grammar and read short paragraphs", 3),
                               ("I read authentic texts and express myself comfortably", 4)]},
    },
}

ISLAMIC_COMPREHENSIVE = {
    "id": "comprehensive",
    "prefix": "ISL_COMP",
    "stages": {
        "S1": {"focus": "Basic Islamic Knowledge", "questions": top("IC_S1", IC.IC_S1)},
        "S2": {"focus": "Belief & Worship Foundations", "questions": top("IC_S2", IC.IC_S2)},
        "S3": {"focus": "Understanding the Islamic Sciences", "questions": top("IC_S3", IC.IC_S3)},
        "S4": {"focus": "Applied Islamic Knowledge", "questions": top("IC_S4", IC.IC_S4)},
    },
    "levelStages": {
        "kids": {1: ["S1"], 2: ["S2"], 3: ["S3"], 4: ["S4"]},
        "adults": {1: ["S1", "S2"], 2: ["S3"], 3: ["S4"]},
    },
    "selfReport": {
        "kids": {"prompt": "First, tell us about yourself: how much have you learned about Islam so far?",
                 "options": [("I am just beginning to learn", 1),
                             ("I know the basics — the pillars, prayer and duas", 2),
                             ("I have studied belief, worship and Seerah in more detail", 3),
                             ("I have studied the Islamic sciences in depth", 4)]},
        "adults": {"prompt": "First, tell us about yourself: how much Islamic Studies have you covered?",
                   "options": [("I am starting from the beginning", 1),
                               ("I know the foundations of belief and worship", 1),
                               ("I have studied belief, fiqh and hadith in more detail", 2),
                               ("I have studied the Islamic sciences at an advanced level", 3)]},
    },
}


def _two_level(pid, prefix, s1, s2, focus1, focus2, sr_kids, sr_adults):
    return {
        "id": pid, "prefix": prefix,
        "stages": {"S1": {"focus": focus1, "questions": s1},
                   "S2": {"focus": focus2, "questions": s2}},
        "levelStages": {"kids": {1: ["S1"], 2: ["S2"]}, "adults": {1: ["S1"], 2: ["S2"]}},
        "selfReport": {
            "kids": {"prompt": sr_kids[0], "options": [(sr_kids[1], 1), (sr_kids[2], 2)]},
            "adults": {"prompt": sr_adults[0], "options": [(sr_adults[1], 1), (sr_adults[2], 2)]},
        },
    }


AQEEDAH = _two_level(
    "aqeedah", "ISL_AQD", top("AQ_S1", AFH.AQ_S1), top("AQ_S2", AFH.AQ_S2),
    "Foundations of Belief", "Applied Aqeedah",
    ("First, tell us about yourself: how much have you learned about Islamic belief?",
     "I am just beginning", "I know the basics of belief already"),
    ("First, tell us about yourself: how much Aqeedah have you studied?",
     "I am starting from the foundations", "I have studied Tawheed and belief in some depth"))

FIQH = _two_level(
    "fiqh", "ISL_FQH", top("FQ_S1", AFH.FQ_S1), top("FQ_S2", AFH.FQ_S2),
    "Foundations of Worship", "Applied Fiqh & Daily Life",
    ("First, tell us about yourself: how much have you learned about prayer, wudu and fasting?",
     "I am just beginning", "I know the basics of worship already"),
    ("First, tell us about yourself: how much Fiqh have you studied?",
     "I am starting with the foundations of worship", "I know the fiqh of worship and want to go further"))

SEERAH = _two_level(
    "seerah", "ISL_SRH", top("SR_S1", STM.SR_S1), top("SR_S2", STM.SR_S2),
    "Key Events & People", "Analytical Seerah",
    ("First, tell us about yourself: how many stories of the Prophet ﷺ do you know?",
     "Only a few", "I know the main events of his life"),
    ("First, tell us about yourself: how much Seerah have you studied?",
     "I know the outline only", "I know the timeline and main events well"))

HADITH = _two_level(
    "hadith", "ISL_HDT", top("HD_S1", AFH.HD_S1), top("HD_S2", AFH.HD_S2),
    "Hadith Foundations", "Hadith Sciences",
    ("First, tell us about yourself: how much have you learned about Hadith?",
     "I am just beginning", "I know what hadith are and have learned some"),
    ("First, tell us about yourself: how much Hadith study have you done?",
     "I am starting with the basics", "I know core hadith and want to study the sciences"))

TAFSIR = _two_level(
    "tafsir", "ISL_TFS", top("TF_S1", STM.TF_S1), top("TF_S2", STM.TF_S2),
    "Tafsir Foundations", "Thematic & Applied Tafsir",
    ("First, tell us about yourself: how much Qur'an meaning have you studied?",
     "I am just beginning", "I have studied the meanings of some surahs"),
    ("First, tell us about yourself: how much Tafsir have you studied?",
     "I am starting with the basics", "I have studied tafsir of several surahs"))

MANNERS = _two_level(
    "manners", "ISL_MAN", top("MN_S1", STM.MN_S1), top("MN_S2", STM.MN_S2),
    "Everyday Islamic Manners", "Character in Practice",
    ("First, tell us about yourself: how much have you learned about Islamic manners?",
     "I am just beginning to learn", "I know the everyday manners and duas well"),
    ("First, tell us about yourself: how much have you studied Islamic manners (adab)?",
     "I am starting with the basics", "I know the foundations of adab well"))


PROGRAMS = {
    ("quran", "reading-tajweed"): READING_TAJWEED,
    ("quran", "memorization"): MEMORIZATION,
    ("quran", "ijazah"): IJAZAH,
    ("arabic", "foundation"): ARABIC_FOUNDATION,
    ("arabic", "advanced"): ARABIC_ADVANCED,
    ("islamic-studies", "comprehensive"): ISLAMIC_COMPREHENSIVE,
    ("islamic-studies", "aqeedah"): AQEEDAH,
    ("islamic-studies", "fiqh"): FIQH,
    ("islamic-studies", "seerah"): SEERAH,
    ("islamic-studies", "hadith"): HADITH,
    ("islamic-studies", "tafsir"): TAFSIR,
    ("islamic-studies", "manners"): MANNERS,
}


def bank(spec, audience, level):
    """The pool of questions available for one audience at one level."""
    if "generated" in spec:
        return spec["generated"][audience][level], spec["levelFocus"][audience][level]
    keys = spec["levelStages"][audience][level]
    items, focuses = [], []
    for k in keys:
        st = spec["stages"][k]
        focuses.append(st["focus"])
        items += [i for i in st["questions"] if i.get("audience", "both") in ("both", audience)]
    return items, " + ".join(focuses)
