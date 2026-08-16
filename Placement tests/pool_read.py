# -*- coding: utf-8 -*-
"""
Reading & Tajweed + Ijazah question pools.

Design rule for every item here: the student must DECODE or APPLY something,
not recall a fact. Letter items are minimal pairs (qaf vs kaf, saad vs seen),
so a student who cannot read cannot eliminate their way to the answer; vowel
items differ only in harakat; tajweed items name the rule for a real phrase.
"""


def q(skill, difficulty, prompt, options, correct, audience="both", arabic=None):
    return dict(skill=skill, difficulty=difficulty, prompt=prompt, options=options,
                correct=correct, audience=audience, arabic=arabic)


# ===========================================================================
# S1 — Letters & Sounds (decoding, minimal pairs)
# ===========================================================================
QT_S1 = [
    q("Letter Sounds", "easy", "What is the name of this letter?", ["Baa", "Taa", "Thaa", "Noon"], 0, arabic="ب", audience="kids"),
    q("Letter Sounds", "easy", "What is the name of this letter?", ["Meem", "Noon", "Laam", "Waaw"], 0, arabic="م", audience="kids"),
    q("Letter Sounds", "easy", "What is the name of this letter?", ["'Ayn", "Ghayn", "Haa", "Khaa"], 0, arabic="ع"),
    q("Letter Sounds", "easy", "What is the name of this letter?", ["Saad", "Seen", "Sheen", "Daad"], 0, arabic="ص"),
    q("Letter Sounds", "easy", "Which letter makes the 'sh' sound?", ["ش", "س", "ص", "ث"], 0, audience="kids"),
    q("Letter Sounds", "medium", "Which letter makes the soft 'th' sound, as in the English word 'thin'?", ["ث", "ذ", "ظ", "ز"], 0),
    q("Letter Sounds", "medium", "Which letter makes the 'th' sound in the English word 'this'?", ["ذ", "ث", "ز", "ض"], 0, audience="adults"),

    q("Reading Words", "easy", "How is this word read?", ["hasan", "hasin", "hazan", "khasan"], 0, arabic="حَسَن"),
    q("Reading Words", "medium", "How is this word read?", ["khabar", "habar", "ghabar", "kabar"], 0, arabic="خَبَر"),
    q("Reading Words", "medium", "How is this word read?", ["sagheer", "saqeer", "shagheer", "sakheer"], 0, arabic="صَغِير", audience="adults"),
    q("Reading Words", "medium", "How is this word read?", ["'amal", "amal", "hamal", "ghamal"], 0, arabic="عَمَل", audience="adults"),

    q("Similar Letters", "medium", "Which word is read 'qalam' (a pen)?", ["قَلَم", "كَلَم", "قَلْب", "كَلْب"], 0),
    q("Similar Letters", "medium", "Which word is read 'kabeer' (big)?", ["كَبِير", "قَبِير", "كَثِير", "كَسِير"], 0),
    q("Similar Letters", "medium", "Which word is read 'sabr' (patience)?", ["صَبْر", "سَبْر", "ثَبْر", "ضَبْر"], 0),
    q("Similar Letters", "medium", "Which word is read 'ta'aam' (food)?", ["طَعَام", "تَعَام", "ظَعَام", "ضَعَام"], 0),
    q("Similar Letters", "hard", "Which word is read 'zuhr' (noon)?", ["ظُهْر", "زُهْر", "ضُهْر", "ذُهْر"], 0, audience="adults"),
    q("Similar Letters", "medium", "Which word is read 'hajj'?", ["حَجّ", "هَجّ", "خَجّ", "عَجّ"], 0),
    q("Similar Letters", "medium", "Which word is read 'shams' (sun)?", ["شَمْس", "سَمْس", "صَمْس", "ثَمْس"], 0, audience="kids"),
    q("Similar Letters", "medium", "Which word is read 'noor' (light)?", ["نُور", "تُور", "ثُور", "بُور"], 0, audience="kids"),
    q("Similar Letters", "hard", "Which word is read 'ghayr' (other than)?", ["غَيْر", "عَيْر", "خَيْر", "حَيْر"], 0, audience="adults"),
    q("Similar Letters", "medium", "Which word is read 'ard' (earth)?", ["أَرْض", "أَرْز", "أَرْد", "أَرْظ"], 0, audience="adults"),
    q("Similar Letters", "medium", "Which word is read 'jadeed' (new)?", ["جَدِيد", "حَدِيد", "خَدِيد", "شَدِيد"], 0),

    q("Letters in Words", "medium", "Which of these words contains the letter ع?", ["عَمَل", "أَمَل", "هَمَل", "حَمَل"], 0),
    q("Letters in Words", "medium", "Which of these words contains the letter ح?", ["حَمْد", "هَمْد", "خَمْد", "عَمْد"], 0),
    q("Letters in Words", "easy", "Which letter is at the beginning of this word?", ["ث", "ت", "ب", "ن"], 0, arabic="ثَمَر", audience="kids"),
    q("Letters in Words", "medium", "Which letter is at the beginning of this word?", ["ص", "س", "ض", "ز"], 0, arabic="صَبَاح"),
]

# ===========================================================================
# S2 — Short Vowels & Word Reading
# ===========================================================================
QT_S2 = [
    q("Short Vowels", "easy", "How is this read?", ["bi", "ba", "bu", "b"], 0, arabic="بِ", audience="kids"),
    q("Short Vowels", "easy", "How is this read?", ["bu", "ba", "bi", "b"], 0, arabic="بُ", audience="kids"),
    q("Short Vowels", "easy", "How is this read?", ["b", "ba", "bi", "bu"], 0, arabic="بْ"),
    q("Short Vowels", "easy", "How is this read?", ["ma", "mi", "mu", "m"], 0, arabic="مَ", audience="kids"),
    q("Short Vowels", "easy", "How is this read?", ["qul", "qal", "qil", "qula"], 0, arabic="قُلْ"),
    q("Short Vowels", "medium", "How is this read?", ["man", "mana", "mani", "manu"], 0, arabic="مَنْ"),
    q("Short Vowels", "medium", "Which word is read 'kutub' (books)?", ["كُتُب", "كَتَب", "كِتَب", "كُتَب"], 0),
    q("Short Vowels", "medium", "Which word is read 'muslim'?", ["مُسْلِم", "مَسْلَم", "مِسْلِم", "مُسْلَم"], 0),
    q("Short Vowels", "hard", "Which word is read 'al-hamdu'?", ["الْحَمْدُ", "الْحَمْدَ", "الْحَمْدِ", "الْحُمْدُ"], 0, audience="adults"),
    q("Short Vowels", "hard", "Which word is read 'istighfaar'?", ["اِسْتِغْفَار", "اِسْتَغْفَار", "اُسْتِغْفَار", "اِسْتِغْفِار"], 0, audience="adults"),

    q("Long Vowels", "medium", "Which word is read 'kitaab', with a long 'aa'?", ["كِتَاب", "كِتَب", "كُتَاب", "كَتَاب"], 0),
    q("Long Vowels", "medium", "Which word is read 'salaam'?", ["سَلَام", "سَلَم", "سِلَام", "سُلَام"], 0, audience="kids"),
    q("Long Vowels", "hard", "Which word is read 'yaqoolu'?", ["يَقُولُ", "يَقُلُ", "يُقُولُ", "يَقَولُ"], 0, audience="adults"),
    q("Long Vowels", "medium", "Which of these words contains a long vowel?", ["كِتَاب", "كَتَب", "كُتُب", "كَتْب"], 0),

    q("Sukoon & Shaddah", "easy", "A shaddah ( ّ ) over a letter tells you to:",
      ["double the letter", "skip the letter", "lengthen the vowel", "change the letter"], 0),
    q("Sukoon & Shaddah", "medium", "Which word is read 'madda', with a doubled 'd'?", ["مَدَّ", "مَدَ", "مُدَّ", "مِدَّ"], 0),
    q("Sukoon & Shaddah", "medium", "Which of these words contains a sukoon?", ["مَسْجِد", "مَدِينَة", "كَتَبَ", "سَمِيع"], 0),
    q("Sukoon & Shaddah", "medium", "Which of these words contains a shaddah?", ["رَبَّنَا", "كَتَبَ", "سَمِيع", "عَلِيم"], 0),
    q("Sukoon & Shaddah", "hard", "Which word is read 'yushrik', with no vowel after the sheen?",
      ["يُشْرِك", "يُشَرِك", "يُشْرَك", "يَشْرِك"], 0, audience="adults"),

    q("Tanween", "medium", "Which word ends with the sound '-un'?", ["كِتَابٌ", "كِتَابٍ", "كِتَابًا", "كِتَابِ"], 0),
    q("Tanween", "medium", "Which word ends with the sound '-an'?", ["كِتَابًا", "كِتَابٌ", "كِتَابٍ", "كِتَابُ"], 0),
    q("Tanween", "hard", "Which word ends with the sound '-in'?", ["كِتَابٍ", "كِتَابٌ", "كِتَابًا", "كِتَابَ"], 0, audience="adults"),
    q("Tanween", "medium", "Two dammas together ( ٌ ) at the end of a word are read as:", ["-un", "-an", "-in", "-oon"], 0, audience="kids"),
]

# ===========================================================================
# S3 — Reading Verses & Core Tajweed  (generated items are added to this pool)
# ===========================================================================
QT_S3 = [
    q("Noon Rules", "medium", "The noon in this phrase is followed by a throat letter. How is it read?",
      ["clearly, with no change (Izhar)", "merged into the next letter (Idgham)",
       "as a meem sound (Iqlab)", "hidden with a nasal sound (Ikhfa)"], 0, arabic="مِنْ خَوْفٍ"),
    q("Noon Rules", "medium", "How is the noon read in this phrase?",
      ["as a meem sound (Iqlab)", "clearly, with no change (Izhar)",
       "merged into the next letter (Idgham)", "hidden with a nasal sound (Ikhfa)"], 0, arabic="مِنْ بَعْدِ"),
    q("Noon Rules", "medium", "How is the noon read in this phrase?",
      ["merged into the next letter (Idgham)", "clearly, with no change (Izhar)",
       "as a meem sound (Iqlab)", "hidden with a nasal sound (Ikhfa)"], 0, arabic="مَنْ يَعْمَلْ"),
    q("Noon Rules", "medium", "How is the noon read in this phrase?",
      ["hidden with a nasal sound (Ikhfa)", "clearly, with no change (Izhar)",
       "merged into the next letter (Idgham)", "as a meem sound (Iqlab)"], 0, arabic="مِنْ ثَمَرَةٍ"),
    q("Noon Rules", "hard", "Which phrase is read with Ikhfa?",
      ["مِنْ قَبْلِ", "مِنْ خَوْفٍ", "مِنْ بَعْدِ", "مَنْ يَقُولُ"], 0, audience="adults"),
    q("Noon Rules", "hard", "Which phrase is read with Izhar?",
      ["مَنْ أَحْسَنَ", "مِنْ ثَمَرَةٍ", "مِنْ بَعْدِ", "مَنْ يَعْمَلْ"], 0, audience="adults"),

    q("Qalqalah", "easy", "Which group of letters gives a light bounce when it carries a sukoon?",
      ["ق ط ب ج د", "ن م و ي", "ص ض ط ظ", "ء ه ع ح"], 0),
    q("Qalqalah", "medium", "Which of these words is read with a Qalqalah bounce?",
      ["يَقْطَعُونَ", "يَعْلَمُونَ", "يَسْمَعُونَ", "يَشْهَدُونَ"], 0),

    q("Madd", "easy", "A natural madd, as in this word, is held for:", ["2 counts", "1 count", "4 counts", "6 counts"], 0, arabic="قَالَ"),
    q("Madd", "medium", "Which of these words contains a natural madd (2 counts)?",
      ["نُوحِيهَا", "جَاءَ", "الضَّالِّينَ", "السَّمَاءِ"], 0, audience="adults"),
    q("Madd", "medium", "In which word is the vowel held longer?", ["قَالَ", "قُلْ", "كَتَبَ", "قَلَم"], 0, audience="kids"),

    q("Reading Accuracy", "medium", "In this word, how is the laam of 'al-' read?",
      ["it is not pronounced; the sheen is doubled", "it is pronounced clearly",
       "it is read with a nasal sound", "it is read as a long vowel"], 0, arabic="الشَّمْس"),
    q("Reading Accuracy", "medium", "In this word, how is the laam of 'al-' read?",
      ["it is pronounced clearly", "it is not pronounced", "it is doubled", "it becomes a meem"], 0, arabic="الْقَمَر"),
    q("Reading Accuracy", "hard", "In which word is the laam of 'al-' silent?",
      ["الرَّحْمَٰن", "الْكِتَاب", "الْحَمْد", "الْعَالَمِين"], 0, audience="adults"),
]

# ===========================================================================
# S4 — Advanced Tajweed & Stopping (generated items are added to this pool)
# ===========================================================================
QT_S4 = [
    q("Madd Types", "medium", "In this word a madd letter is followed by a hamzah in the same word. This madd is:",
      ["Madd Muttasil", "Madd Tabee'i", "Madd Munfasil", "Madd Lazim"], 0, arabic="جَاءَ"),
    q("Madd Types", "hard", "A madd letter ends one word and a hamzah begins the next. This madd is:",
      ["Madd Munfasil", "Madd Muttasil", "Madd Lazim", "Madd Tabee'i"], 0, arabic="إِنَّا أَنْزَلْنَا"),
    q("Madd Types", "hard", "In this word the madd letter is followed by a sukoon in the same word. It is held for:",
      ["6 counts", "2 counts", "4 counts", "1 count"], 0, arabic="الضَّالِّينَ"),
    q("Madd Types", "hard", "Which word contains a Madd Lazim?",
      ["الضَّالِّينَ", "الرَّحِيمِ", "الْعَالَمِينَ", "نَسْتَعِينُ"], 0, audience="adults"),

    q("Meem Rules", "medium", "A meem with a sukoon followed by another meem is read as:",
      ["Idgham Shafawi", "Izhar Shafawi", "Ikhfa Shafawi", "Qalqalah"], 0),
    q("Meem Rules", "hard", "A meem with a sukoon followed by a baa is read as:",
      ["Ikhfa Shafawi", "Idgham Shafawi", "Izhar Shafawi", "Iqlab"], 0, audience="adults"),
    q("Meem Rules", "hard", "Which phrase contains Ikhfa Shafawi?",
      ["تَرْمِيهِمْ بِحِجَارَةٍ", "لَهُمْ مَا يَشَاءُونَ", "عَلَيْهِمْ وَلَا", "أَمْ لَمْ"], 0, audience="adults"),

    q("Tajweed Rules", "hard", "What is the difference between Idgham and Ikhfa?",
      ["Idgham merges the noon; Ikhfa hides it with a nasal sound",
       "Ikhfa merges the noon; Idgham hides it with a nasal sound",
       "Idgham applies to meem only; Ikhfa to noon only",
       "Idgham is used when stopping; Ikhfa when continuing"], 0),
    q("Tajweed Rules", "medium", "Which pair of letters takes Idgham WITHOUT a nasal sound?",
      ["ل ر", "ي و", "ن م", "ب م"], 0, audience="adults"),

    q("Stopping & Starting", "easy", "A waqf sign of 'مـ' over a word means:",
      ["you must stop here", "you must not stop here", "stopping is optional", "you should repeat the verse"], 0),
    q("Stopping & Starting", "easy", "A waqf sign of 'لا' over a word means:",
      ["do not stop here", "you must stop here", "stop only in a group", "stop and repeat"], 0),
    q("Stopping & Starting", "medium", "A waqf sign of 'ج' over a word means:",
      ["stopping is permitted", "stopping is forbidden", "you must stop", "you must repeat the word"], 0, audience="adults"),
    q("Stopping & Starting", "medium", "After stopping in the middle of a verse, you should start again:",
      ["from a point that keeps the meaning complete", "from the same word every time",
       "from the beginning of the surah", "from the next verse"], 0),
    q("Stopping & Starting", "hard", "When you stop at a word ending in a tanween, the tanween is:",
      ["not pronounced", "pronounced as usual", "doubled", "changed into a madd"], 0, audience="adults"),
]

# ===========================================================================
# Ijazah — S1 advanced precision, S2 readiness & correction
# ===========================================================================
QI_S1 = [
    q("Madd Precision", "medium", "Madd Lazim is held for 6 counts because:",
      ["a sukoon or shaddah follows it in the same word",
       "the word falls at the end of a verse or surah",
       "the reciter chooses to lengthen the sound",
       "it appears in the opening letters of a surah"], 0),
    q("Madd Precision", "hard", "In the recitation of Hafs 'an 'Asim, Madd Munfasil is normally read for:",
      ["4 or 5 counts", "exactly 2 counts", "exactly 6 counts", "just 1 count"], 0),
    q("Madd Precision", "hard", "Madd 'Aridh lil-Sukoon occurs when:",
      ["a madd letter comes before a stop", "a madd letter is followed by a hamzah",
       "two madd letters meet in one word", "a madd letter carries a shaddah"], 0),
    q("Madd Precision", "hard", "Which of these is read with 6 counts?",
      ["الضَّالِّينَ", "السَّمَاءِ", "نُوحِيهَا", "قَالَ"], 0),
    q("Madd Precision", "medium", "The opening letters 'الم' are recited as:",
      ["each letter named separately with its madd",
       "as one continuous word, exactly as written",
       "silently, without pronouncing the letters",
       "with an explanation of their meaning"], 0),

    q("Makharij & Sifaat", "medium", "Which pair of letters is emphatic and often confused, though their makharij differ?",
      ["ض and ظ", "ب and م", "ت and ك", "و and ي"], 0),
    q("Makharij & Sifaat", "hard", "Which letter has the quality of Istitalah?", ["ض", "ص", "ط", "ق"], 0),
    q("Makharij & Sifaat", "hard", "Which group are the letters of Isti'la (always read heavy)?",
      ["خ ص ض ط ظ ق غ", "ب ت ث ج ح د ذ", "ل ر ن م و ي", "ا و ي ه ء"], 0),
    q("Makharij & Sifaat", "hard", "Which letter is produced from the deepest part of the throat?", ["ء", "ع", "غ", "ه"], 0),
    q("Makharij & Sifaat", "hard", "The letter ر is described as having Takrir, which means the reciter must:",
      ["avoid letting the tongue tip repeat",
       "roll the sound deliberately each time",
       "hold the sound for two full counts",
       "produce the sound from the throat"], 0),
    q("Makharij & Sifaat", "medium", "Which letters are read with Hams (a whispered flow of breath)?",
      ["ف ح ث ه ش خ ص س ك ت", "ب ج د ط ق ء ذ ز ظ غ", "ن م و ي ل ر ع ح غ خ", "ص ض ط ظ ق غ خ ر ل م"], 0),

    q("Applied Rules", "medium", "How many letters take Ikhfa after a noon sakinah?", ["15", "6", "10", "28"], 0),
    q("Applied Rules", "hard", "When two identical letters meet, the first with sukoon, this is:",
      ["Idgham Mutamathilayn", "Idgham Mutajanisayn", "Idgham Mutaqaribayn", "Ikhfa with a ghunnah"], 0),
    q("Applied Rules", "hard", "In 'قَدْ تَبَيَّنَ' the daal meets a taa. This is an example of:",
      ["Idgham Mutajanisayn", "Idgham Mutamathilayn", "Idgham Mutaqaribayn", "Ikhfa with a ghunnah"], 0),
    q("Applied Rules", "hard", "Where does Ghunnah last the longest?",
      ["in a doubled noon or meem", "in Izhar with a throat letter",
       "when stopping at the end of a verse", "in a natural two-count madd"], 0),
    q("Applied Rules", "medium", "Which phrase requires Iqlab?",
      ["مِنْ بَعْدِ", "مِنْ خَوْفٍ", "مَنْ يَعْمَلْ", "مِنْ ثَمَرَةٍ"], 0),
]

QI_S2 = [
    q("Correction Skill", "medium", "A student reads 'مِنْ بَعْدِ' with a clear noon. Which rule did they miss?",
      ["Iqlab", "Izhar", "Idgham", "Qalqalah"], 0),
    q("Correction Skill", "medium", "A student reads ق exactly like ك. The correction is to:",
      ["raise the back of the tongue to the soft palate",
       "press the tongue tip against the front teeth",
       "read the letter more quietly and softly",
       "hold the letter for two full counts"], 0),
    q("Correction Skill", "medium", "A student stops at a word marked 'لا'. You should tell them:",
      ["that the meaning continues, so not to stop",
       "to stop there for a slightly longer moment",
       "to repeat the verse from the very start",
       "that stopping there is actually preferred"], 0),
    q("Correction Skill", "hard", "A student reads الضَّالِّينَ with 2 counts. The error is in:",
      ["the length of the madd", "the point of articulation", "the ghunnah on the noon", "the qalqalah bounce"], 0),
    q("Correction Skill", "hard", "A student pronounces ط as a heavy ت but with no Qalqalah at a sukoon. They have:",
      ["kept the makhraj but dropped a sifah", "kept the sifah but changed the makhraj",
       "changed both the makhraj and the sifah", "made no error at all"], 0),
    q("Correction Skill", "hard", "A student reads ذ as ز throughout. The best correction is to:",
      ["place the tongue tip on the upper teeth edge",
       "press the tongue against the roof of the mouth",
       "read the letter more heavily and firmly", "shorten the letter and move on quickly"], 0),
    q("Correction Skill", "medium", "A student adds a vowel to a letter that carries a sukoon. This error is called:",
      ["adding a haraka to a sakin letter", "shortening a madd that must be long",
       "dropping the ghunnah from a noon", "changing the makhraj of a letter"], 0),

    q("Ijazah Knowledge", "medium", "An Ijazah with sanad certifies that:",
      ["the reciter read to a teacher in an unbroken chain",
       "the reciter attended a fixed number of lessons",
       "the reciter passed a long written examination",
       "the reciter may now teach Arabic grammar too"], 0),
    q("Ijazah Knowledge", "medium", "The widely used riwayah of Hafs is transmitted from which imam?",
      ["'Asim", "Nafi'", "Ibn Kathir", "Abu 'Amr"], 0),
    q("Ijazah Knowledge", "hard", "Warsh is a transmitter of which imam's reading?",
      ["Nafi'", "'Asim", "Al-Kisa'i", "Ibn 'Amir"], 0),
    q("Ijazah Knowledge", "hard", "How many mutawatir readings (qira'at) are usually counted?",
      ["10", "4", "7 only", "14"], 0),
    q("Ijazah Knowledge", "hard", "'Talaqqi' in Qur'anic transmission means:",
      ["taking the recitation from a teacher directly", "reading only from a written copy of the text",
       "memorising without any correction at all", "learning from audio recordings alone"], 0),
    q("Ijazah Knowledge", "medium", "Before granting an ijazah, the teacher must be satisfied that the student:",
      ["recites the whole portion without error",
       "has memorised the Qur'an within one year",
       "has studied Arabic grammar formally",
       "can name the ten canonical readings"], 0),

    q("Advanced Application", "hard", "Sakt (a brief pause without breathing) is applied in Hafs at:",
      ["a small number of specific places", "the end of every single verse",
       "every waqf sign on the page", "the beginning of each new surah"], 0),
    q("Advanced Application", "hard", "'Tarteel' as commanded in the Qur'an refers to:",
      ["measured recitation, letter by letter", "the fastest pace a reciter can manage",
       "reciting from memory without a copy", "reciting together in a large group"], 0),
    q("Advanced Application", "hard", "When a reciter stops on a word ending with a shaddah, the doubling is:",
      ["still pronounced fully", "dropped completely", "replaced by a long madd", "read as a ghunnah instead"], 0),
    q("Advanced Application", "medium", "Which of these must be avoided when reciting?",
      ["stretching a natural madd to six counts", "giving the ghunnah its full measure",
       "observing the waqf signs carefully", "reciting at a calm, measured pace"], 0),
]
