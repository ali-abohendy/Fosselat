# -*- coding: utf-8 -*-
"""
Arabic Foundation + Post-Foundation question pools.

Foundation items are decoding items: the four options differ only in letters or
in harakat, so the answer cannot be reached by elimination. Post-Foundation
items are use-in-context items: every comprehension question carries its own
passage, so it stands alone however the engine shuffles the set.
"""


def q(skill, difficulty, prompt, options, correct, audience="both", arabic=None):
    return dict(skill=skill, difficulty=difficulty, prompt=prompt, options=options,
                correct=correct, audience=audience, arabic=arabic)


# ===========================================================================
# FOUNDATION S1 — the letters
# ===========================================================================
AF_S1 = [
    q("Letter Names", "easy", "What is the name of this letter?", ["Seen", "Sheen", "Saad", "Zaay"], 0, arabic="س", audience="kids"),
    q("Letter Names", "easy", "What is the name of this letter?", ["Meem", "Noon", "Laam", "Waaw"], 0, arabic="م", audience="kids"),
    q("Letter Names", "easy", "What is the name of this letter?", ["Thaal", "Daal", "Zaay", "Raa"], 0, arabic="ذ"),
    q("Letter Names", "easy", "What is the name of this letter?", ["Kaaf", "Qaaf", "Faa", "Laam"], 0, arabic="ك", audience="kids"),
    q("Letter Names", "easy", "What is the name of this letter?", ["Haa", "Khaa", "Jeem", "'Ayn"], 0, arabic="ح"),
    q("Letter Sounds", "easy", "Which letter makes the 'l' sound?", ["ل", "ن", "ر", "م"], 0, audience="kids"),
    q("Letter Sounds", "easy", "Which letter makes the 'w' sound?", ["و", "ي", "ه", "ف"], 0, audience="kids"),
    q("Letter Sounds", "easy", "Which letter makes the 'y' sound?", ["ي", "و", "ن", "ب"], 0, audience="kids"),
    q("Letter Sounds", "medium", "Which letter makes the 'k' sound as in 'kite'?", ["ك", "ق", "ج", "خ"], 0),
    q("Letter Sounds", "medium", "Which letter makes a sound English does not have, made deep in the throat?", ["ع", "ب", "ت", "س"], 0, audience="adults"),

    q("Letter Shapes", "medium", "Which two letters have the same shape and differ only in their dots?",
      ["ب and ت", "ح and ه", "ك and ل", "م and و"], 0),
    q("Letter Shapes", "medium", "Which of these letters does NOT join to the letter after it?", ["د", "ب", "ت", "ك"], 0),
    q("Letter Shapes", "medium", "Which of these letters DOES join to the letter after it?", ["ب", "د", "ر", "و"], 0),
    q("Letter Shapes", "hard", "Which of these words is written with all its letters joined?",
      ["بتك", "دار", "روز", "وزر"], 0, audience="adults"),
    q("Letter Shapes", "medium", "Which of these shows the letters ب + ي + ت joined correctly?", ["بيت", "بتي", "يبت", "تيب"], 0),
    q("Letter Shapes", "hard", "Which of these shows the letters م + د + ر + س + ة joined correctly?",
      ["مدرسة", "مرسدة", "مسدرة", "مدسرة"], 0),

    q("Letters in Words", "medium", "Which of these words contains the letter ه?", ["نَهَر", "نَظَر", "نَشَر", "نَصَر"], 0),
    q("Letters in Words", "medium", "Which of these words contains the letter ك?", ["مَكْتَب", "مَنْصَب", "مَذْهَب", "مَشْرَب"], 0),
    q("Letters in Words", "medium", "Which letter is at the end of this word?", ["ة", "ه", "ت", "ث"], 0, arabic="مَدِينَة"),
    q("Letters in Words", "medium", "How many letters are in this word?", ["5", "6", "4", "7"], 0, arabic="مَدْرَسَة"),
    q("Letters in Words", "medium", "How many letters are in this word?", ["4", "3", "5", "6"], 0, arabic="كِتَاب", audience="kids"),

    q("Alphabet Order", "easy", "Which letter comes directly after ت?", ["ث", "ج", "ب", "خ"], 0, audience="kids"),
    q("Alphabet Order", "medium", "Which letter comes directly before ج?", ["ث", "ح", "ت", "خ"], 0),
    q("Alphabet Order", "easy", "How many letters are there in the Arabic alphabet?", ["28", "22", "26", "30"], 0),
    q("Alphabet Order", "medium", "Which of these letters comes last in the alphabet?", ["ي", "و", "ه", "ن"], 0, audience="adults"),
]

# ===========================================================================
# FOUNDATION S2 — vowels, joining, syllables
# ===========================================================================
AF_S2 = [
    q("Short Vowels", "easy", "Which mark gives a short 'u' sound?", ["Damma ( ُ )", "Fatha ( َ )", "Kasra ( ِ )", "Sukoon ( ْ )"], 0),
    q("Short Vowels", "easy", "Which mark gives a short 'i' sound?", ["Kasra ( ِ )", "Fatha ( َ )", "Damma ( ُ )", "Sukoon ( ْ )"], 0),
    q("Short Vowels", "easy", "How is this read?", ["si", "sa", "su", "s"], 0, arabic="سِ", audience="kids"),
    q("Short Vowels", "easy", "How is this read?", ["su", "sa", "si", "s"], 0, arabic="سُ", audience="kids"),
    q("Short Vowels", "easy", "How is this read?", ["s", "sa", "si", "su"], 0, arabic="سْ", audience="kids"),
    q("Short Vowels", "medium", "Which word is read 'bayt' (a house)?", ["بَيْت", "بِيت", "بُيْت", "بَيَت"], 0),
    q("Short Vowels", "medium", "Which word is read 'madrasa' (a school)?", ["مَدْرَسَة", "مُدْرَسَة", "مَدَرْسَة", "مِدْرَسَة"], 0),
    q("Short Vowels", "medium", "Which word is read 'jameel' (beautiful)?", ["جَمِيل", "جَمَيل", "جُمِيل", "جَمِل"], 0),
    q("Short Vowels", "hard", "Which word is read 'muhandis' (an engineer)?",
      ["مُهَنْدِس", "مَهَنْدِس", "مُهُنْدِس", "مُهَنْدَس"], 0, audience="adults"),

    q("Long Vowels", "medium", "Which word contains a long 'aa'?", ["بَاب", "بَتّ", "بُنّ", "بِنْت"], 0),
    q("Long Vowels", "medium", "Which word is read 'noor' with a long 'oo'?", ["نُور", "نُر", "نَوْر", "نِير"], 0),
    q("Long Vowels", "hard", "Which word has a long vowel in the MIDDLE?", ["كَبِير", "كَتَبَ", "كُتُب", "كَلْب"], 0, audience="adults"),

    q("Shaddah & Sukoon", "medium", "Which word is read 'sittah' (six), with a doubled 't'?",
      ["سِتَّة", "سِتَة", "سُتَّة", "سِتِّة"], 0),
    q("Shaddah & Sukoon", "medium", "In which word does the noon carry no vowel?", ["مِنْ", "مِنَ", "مِنِ", "مِنُ"], 0),
    q("Shaddah & Sukoon", "medium", "Which word is read 'mudarris' (a teacher), with a doubled 'r'?",
      ["مُدَرِّس", "مُدَرِس", "مُدَرَّس", "مُدْرِس"], 0, audience="adults"),
    q("Shaddah & Sukoon", "easy", "A shaddah ( ّ ) over a letter means the letter is:",
      ["doubled", "silent", "read long", "skipped"], 0, audience="kids"),

    q("Tanween", "medium", "Which word ends with the sound '-un'?", ["بَيْتٌ", "بَيْتٍ", "بَيْتًا", "بَيْتُ"], 0),
    q("Tanween", "medium", "Which word ends with the sound '-an'?", ["بَيْتًا", "بَيْتٌ", "بَيْتٍ", "بَيْتَ"], 0),
    q("Tanween", "hard", "Which word ends with the sound '-in'?", ["بَيْتٍ", "بَيْتٌ", "بَيْتًا", "بَيْتِ"], 0, audience="adults"),

    q("Reading Syllables", "medium", "How is this read?", ["ka-ta-ba", "ki-ta-ba", "ka-ti-ba", "ku-tu-bu"], 0, arabic="كَتَبَ"),
    q("Reading Syllables", "medium", "How is this read?", ["mas-jid", "ma-sa-jid", "mus-jid", "mis-jad"], 0, arabic="مَسْجِد"),
    q("Reading Syllables", "hard", "How is this read?", ["yad-ru-su", "ya-dur-su", "yud-ra-su", "ya-dra-su"], 0, arabic="يَدْرُسُ", audience="adults"),
    q("Reading Syllables", "medium", "How is this read?", ["wa-lad", "wal-da", "wu-lid", "wa-lid"], 0, arabic="وَلَد", audience="kids"),
]

# ===========================================================================
# FOUNDATION S3 — reading words and their meanings
# ===========================================================================
AF_S3 = [
    q("Vocabulary", "easy", "What does this word mean?", ["House", "Book", "Water", "Sun"], 0, arabic="بَيْت", audience="kids"),
    q("Vocabulary", "easy", "What does this word mean?", ["Book", "Pen", "Door", "Boy"], 0, arabic="كِتَاب", audience="kids"),
    q("Vocabulary", "easy", "What does this word mean?", ["Water", "Moon", "Milk", "Fire"], 0, arabic="مَاء", audience="kids"),
    q("Vocabulary", "easy", "What does this word mean?", ["School", "Street", "Garden", "Kitchen"], 0, arabic="مَدْرَسَة"),
    q("Vocabulary", "medium", "What does this word mean?", ["Moon", "Sun", "Star", "Sky"], 0, arabic="قَمَر"),
    q("Vocabulary", "medium", "What does this word mean?", ["Door", "Wall", "Window", "Roof"], 0, arabic="بَاب", audience="kids"),
    q("Vocabulary", "medium", "What does this word mean?", ["Hand", "Foot", "Eye", "Ear"], 0, arabic="يَد", audience="kids"),
    q("Vocabulary", "medium", "What does this word mean?", ["Market", "Mosque", "Hospital", "Library"], 0, arabic="سُوق", audience="adults"),
    q("Vocabulary", "medium", "What does this word mean?", ["Work", "Rest", "Travel", "Study"], 0, arabic="عَمَل", audience="adults"),
    q("Vocabulary", "medium", "What does this word mean?", ["Bread", "Rice", "Meat", "Milk"], 0, arabic="خُبْز"),

    q("Word Reading", "medium", "Which word means 'a pen'?", ["قَلَم", "قَمَر", "قَلْب", "كَلْب"], 0),
    q("Word Reading", "medium", "Which word means 'a girl'?", ["بِنْت", "وَلَد", "رَجُل", "أُمّ"], 0),
    q("Word Reading", "medium", "Which word means 'a boy'?", ["وَلَد", "بِنْت", "بَلَد", "وَالِد"], 0),
    q("Word Reading", "medium", "Which word means 'the sun'?", ["الشَّمْس", "الْقَمَر", "السَّمَاء", "النَّجْم"], 0, audience="kids"),
    q("Word Reading", "hard", "Which word means 'a key'?", ["مِفْتَاح", "مِصْبَاح", "مِيزَان", "مِنْشَار"], 0, audience="adults"),
    q("Word Reading", "hard", "Which word means 'a father'?", ["أَب", "أُمّ", "ابْن", "أَخ"], 0),
    q("Word Reading", "medium", "Which word means 'a cat'?", ["قِطّ", "كَلْب", "قَلْب", "خَيْل"], 0, audience="kids"),

    q("Word Groups", "medium", "Which word does NOT belong with the others?",
      ["كِتَاب (book)", "تُفَّاح (apple)", "مَوْز (banana)", "عِنَب (grapes)"], 0),
    q("Word Groups", "medium", "Which word does NOT belong with the others?",
      ["مَاء (water)", "قَلَم (pen)", "كِتَاب (book)", "دَفْتَر (notebook)"], 0),
    q("Word Groups", "hard", "Which word is the plural of كِتَاب?", ["كُتُب", "كِتَابَة", "كَاتِب", "مَكْتَب"], 0, audience="adults"),
    q("Word Groups", "hard", "Which word is the plural of وَلَد?", ["أَوْلَاد", "وِلَادَة", "وَالِد", "مَوْلُود"], 0, audience="adults"),
    q("Word Groups", "medium", "Which of these is a colour?", ["أَحْمَر", "كَبِير", "قَرِيب", "جَدِيد"], 0),
    q("Word Reading", "medium", "Which word means 'a road'?", ["طَرِيق", "طَبِيب", "طَعَام", "طَالِب"], 0),
    q("Word Reading", "medium", "Which word means 'a doctor'?", ["طَبِيب", "طَالِب", "كَاتِب", "حَاسِب"], 0),
    q("Vocabulary", "medium", "What does this word mean?", ["Money", "Time", "Work", "Food"], 0, arabic="مَال"),
    q("Vocabulary", "easy", "What does this word mean?", ["Milk", "Water", "Bread", "Honey"], 0, arabic="لَبَن"),
]

# ===========================================================================
# FOUNDATION S4 — short sentences
# ===========================================================================
AF_S4 = [
    q("Sentences", "medium", "What does this sentence mean?",
      ["This is a big house", "This is a small book", "That is my school", "This is a new pen"], 0, arabic="هَذَا بَيْتٌ كَبِيرٌ."),
    q("Sentences", "medium", "What does this sentence mean?",
      ["The door is open", "The door is closed", "The house is big", "The book is new"], 0, arabic="الْبَابُ مَفْتُوحٌ."),
    q("Sentences", "medium", "What does this sentence mean?",
      ["I have a new book", "I want a new book", "This book is mine", "The book is on the table"], 0, arabic="عِنْدِي كِتَابٌ جَدِيدٌ."),
    q("Sentences", "medium", "What does this sentence mean?",
      ["The boy is in the school", "The boy is in the house", "The girl is in the school", "The boy went to school"], 0,
      arabic="الْوَلَدُ فِي الْمَدْرَسَةِ."),
    q("Sentences", "hard", "What does this sentence mean?",
      ["The teacher is in the classroom", "The teacher went home", "The student is in the classroom", "The classroom is large"], 0,
      arabic="الْمُعَلِّمُ فِي الْفَصْلِ.", audience="adults"),
    q("Sentences", "medium", "Which sentence means 'This is a small book'?",
      ["هَذَا كِتَابٌ صَغِيرٌ", "هَذَا كِتَابٌ كَبِيرٌ", "هَذِهِ مَدْرَسَةٌ صَغِيرَةٌ", "ذَلِكَ بَيْتٌ صَغِيرٌ"], 0),
    q("Sentences", "hard", "Which sentence means 'The girl is reading a book'?",
      ["الْبِنْتُ تَقْرَأُ كِتَابًا", "الْبِنْتُ تَكْتُبُ كِتَابًا", "الْوَلَدُ يَقْرَأُ كِتَابًا", "الْبِنْتُ قَرَأَتْ كِتَابًا"], 0, audience="adults"),

    q("Words in Context", "medium", "Which word completes the sentence: 'أَنَا ___ فِي الْبَيْتِ' (I am in the house)?",
      ["أَسْكُنُ", "أَكْتُبُ", "أَشْرَبُ", "أَقْرَأُ"], 0),
    q("Words in Context", "medium", "Which word means 'this' for a feminine word?", ["هَذِهِ", "هَذَا", "ذَلِكَ", "هُنَاكَ"], 0),
    q("Words in Context", "medium", "Which word means 'in'?", ["فِي", "عَلَى", "مِنْ", "إِلَى"], 0, audience="kids"),
    q("Words in Context", "medium", "Which word means 'on'?", ["عَلَى", "فِي", "مِنْ", "مَعَ"], 0, audience="kids"),
    q("Words in Context", "medium", "Which question word means 'where'?", ["أَيْنَ", "مَنْ", "مَاذَا", "كَيْفَ"], 0),
    q("Words in Context", "medium", "Which question word means 'who'?", ["مَنْ", "مَا", "أَيْنَ", "مَتَى"], 0),
    q("Words in Context", "hard", "Which question word means 'when'?", ["مَتَى", "أَيْنَ", "كَيْفَ", "لِمَاذَا"], 0, audience="adults"),

    q("Everyday Arabic", "easy", "What does 'مَرْحَبًا' mean?", ["Hello", "Goodbye", "Thank you", "Please"], 0, audience="kids"),
    q("Everyday Arabic", "easy", "How do you say 'thank you'?", ["شُكْرًا", "عَفْوًا", "أَهْلًا", "مَعَ السَّلَامَة"], 0, audience="kids"),
    q("Everyday Arabic", "easy", "Which number is 'ثَلَاثَة'?", ["3", "1", "2", "4"], 0, audience="kids"),
    q("Everyday Arabic", "medium", "Which number is 'سَبْعَة'?", ["7", "6", "8", "9"], 0),
    q("Everyday Arabic", "medium", "Someone asks 'كَيْفَ حَالُكَ؟'. Which reply fits?",
      ["بِخَيْر، الْحَمْدُ لِلَّه", "مَعَ السَّلَامَة", "مِنْ فَضْلِك", "إِلَى اللِّقَاء"], 0),
    q("Everyday Arabic", "medium", "Someone says 'شُكْرًا'. Which reply fits?",
      ["عَفْوًا", "مَرْحَبًا", "مَتَى؟", "أَيْنَ؟"], 0, audience="adults"),
    q("Everyday Arabic", "hard", "Which sentence asks 'What is your name?'",
      ["مَا اسْمُكَ؟", "كَمْ عُمْرُكَ؟", "أَيْنَ تَسْكُنُ؟", "مَاذَا تَعْمَلُ؟"], 0),
]

# ===========================================================================
# POST-FOUNDATION S1 — everyday use
# ===========================================================================
AA_S1 = [
    q("Vocabulary", "easy", "What does this word mean?", ["Sister", "Brother", "Mother", "Daughter"], 0, arabic="أُخْت"),
    q("Vocabulary", "medium", "What does this word mean?", ["Hospital", "School", "Market", "Library"], 0, arabic="مُسْتَشْفَى"),
    q("Vocabulary", "medium", "What does this word mean?", ["Kitchen", "Bedroom", "Garden", "Balcony"], 0, arabic="مَطْبَخ"),
    q("Vocabulary", "medium", "What does this word mean?", ["Week", "Month", "Year", "Day"], 0, arabic="أُسْبُوع"),
    q("Vocabulary", "medium", "Which word means 'a female teacher'?", ["مُعَلِّمَة", "مُعَلِّم", "مُعَلِّمُونَ", "مُعَلِّمَات"], 0),
    q("Vocabulary", "medium", "Which phrase means 'in the morning'?", ["فِي الصَّبَاحِ", "فِي اللَّيْلِ", "فِي الْمَسَاءِ", "بَعْدَ غَدٍ"], 0),
    q("Vocabulary", "medium", "Which word does NOT belong with the others?",
      ["سَيَّارَة (car)", "تُفَّاحَة (apple)", "بُرْتُقَالَة (orange)", "مَوْزَة (banana)"], 0),
    q("Vocabulary", "hard", "Which word means 'busy'?", ["مَشْغُول", "مَسْرُور", "مَشْهُور", "مَفْتُوح"], 0),
    q("Vocabulary", "medium", "Which word means 'tomorrow'?", ["غَدًا", "أَمْسِ", "الْيَوْمَ", "الْآنَ"], 0),
    q("Vocabulary", "medium", "Which word means 'difficult'?", ["صَعْب", "سَهْل", "قَرِيب", "بَعِيد"], 0, audience="kids"),

    q("Conversation", "medium", "Someone asks 'مَاذَا تَعْمَلُ؟'. Which reply fits?",
      ["أَنَا طَالِب", "أَنَا بِخَيْر، شُكْرًا", "نَعَمْ، مِنْ فَضْلِك", "السَّلَامُ عَلَيْكُم"], 0),
    q("Conversation", "medium", "Someone asks 'كَمْ عَدَدُ أَفْرَادِ عَائِلَتِكَ؟'. Which reply fits?",
      ["عَائِلَتِي خَمْسَةُ أَفْرَادٍ", "أَنَا بِخَيْر", "السَّاعَةُ الرَّابِعَة", "هَذَا كِتَابِي"], 0),
    q("Conversation", "medium", "Someone asks 'مِنْ أَيْنَ أَنْتَ؟'. Which reply fits?",
      ["أَنَا مِنْ مِصْرَ", "أَنَا فِي الْبَيْتِ", "عُمْرِي عِشْرُونَ سَنَةً", "اسْمِي أَحْمَد"], 0),
    q("Conversation", "easy", "Someone asks 'كَمْ السَّاعَةُ؟'. Which reply fits?",
      ["السَّاعَةُ الْخَامِسَة", "أَنَا بِخَيْر", "فِي الْمَدْرَسَةِ", "نَعَمْ، شُكْرًا"], 0),
    q("Conversation", "medium", "You want to ask politely for something. Which phrase do you use?",
      ["مِنْ فَضْلِك", "مَعَ السَّلَامَة", "لَا أَعْرِف", "إِلَى اللِّقَاء"], 0),
    q("Conversation", "medium", "Which greeting fits when you arrive somewhere in the evening?",
      ["مَسَاءَ الْخَيْرِ", "صَبَاحَ الْخَيْرِ", "تَصْبَحُ عَلَى خَيْرٍ", "مَعَ السَّلَامَة"], 0),
    q("Conversation", "hard", "A colleague says 'أَعْتَذِرُ عَنِ التَّأْخِيرِ'. What have they done?",
      ["Apologised for being late", "Asked for directions", "Thanked you", "Said goodbye"], 0, audience="adults"),
    q("Conversation", "medium", "What does this sentence mean?", ["I am from Egypt", "I am going to Egypt", "I live in Egypt", "Egypt is beautiful"], 0,
      arabic="أَنَا مِنْ مِصْرَ."),
    q("Conversation", "medium", "What does this sentence mean?",
      ["I have two brothers", "I have two sisters", "My brother is here", "My brothers are students"], 0, arabic="لِي أَخَوَانِ."),
    q("Conversation", "hard", "What does this sentence mean?",
      ["The lesson starts at eight", "The lesson ends at eight", "The lesson is at the school", "The lesson is difficult"], 0,
      arabic="يَبْدَأُ الدَّرْسُ فِي الثَّامِنَةِ.", audience="adults"),
]

# ===========================================================================
# POST-FOUNDATION S2 — verbs and sentence building
# ===========================================================================
AA_S2 = [
    q("Verbs", "easy", "'كَتَبَتْ' is the past tense conjugated for:", ["She", "He", "They", "We"], 0),
    q("Verbs", "medium", "Which form means 'they (masculine) write'?", ["يَكْتُبُونَ", "يَكْتُبُ", "كَتَبُوا", "نَكْتُبُ"], 0),
    q("Verbs", "medium", "Which form means 'we studied'?", ["دَرَسْنَا", "دَرَسْتُ", "نَدْرُسُ", "دَرَسُوا"], 0),
    q("Verbs", "easy", "Which form means 'I am reading'?", ["أَقْرَأُ", "يَقْرَأُ", "قَرَأْتُ", "نَقْرَأُ"], 0),
    q("Verbs", "hard", "Which sentence is in the future?",
      ["سَأَذْهَبُ إِلَى السُّوقِ", "ذَهَبْتُ إِلَى السُّوقِ", "أَذْهَبُ إِلَى السُّوقِ", "لَمْ أَذْهَبْ إِلَى السُّوقِ"], 0),
    q("Verbs", "medium", "Which sentence is a command?",
      ["اِقْرَأْ الدَّرْسَ", "قَرَأَ الدَّرْسَ", "يَقْرَأُ الدَّرْسَ", "سَيَقْرَأُ الدَّرْسَ"], 0),
    q("Verbs", "medium", "Which word means 'he ate'?", ["أَكَلَ", "يَأْكُلُ", "آكِل", "أَكْل"], 0, audience="kids"),

    q("Sentence Formation", "medium", "Put these words in order: [ الْمَدْرَسَةِ / إِلَى / الطَّالِبُ / ذَهَبَ ]",
      ["ذَهَبَ الطَّالِبُ إِلَى الْمَدْرَسَةِ", "الطَّالِبُ إِلَى ذَهَبَ الْمَدْرَسَةِ",
       "إِلَى الْمَدْرَسَةِ ذَهَبَ الطَّالِبُ", "الْمَدْرَسَةِ الطَّالِبُ إِلَى ذَهَبَ"], 0),
    q("Sentence Formation", "easy", "Which sentence uses the definite article correctly?",
      ["الْبَيْتُ الْكَبِيرُ", "بَيْتُ الْكَبِيرُ", "الْبَيْتُ كَبِيرُ الْ", "الْ بَيْتُ كَبِيرٌ"], 0),
    q("Sentence Formation", "medium", "Which sentence is correct?",
      ["هِيَ مُعَلِّمَةٌ نَشِيطَةٌ", "هِيَ مُعَلِّمٌ نَشِيطٌ", "هُوَ مُعَلِّمَةٌ نَشِيطَةٌ", "هِيَ مُعَلِّمُونَ نَشِيطُونَ"], 0),
    q("Sentence Formation", "medium", "Which word completes 'أَنَا ___ فِي دِمَشْقَ' (I live in Damascus)?",
      ["أَسْكُنُ", "أَكْتُبُ", "أَشْرَبُ", "أَذْهَبُ"], 0),
    q("Sentence Formation", "medium", "Which sentence means 'I read a book every day'?",
      ["أَقْرَأُ كِتَابًا كُلَّ يَوْمٍ", "قَرَأْتُ كِتَابًا أَمْسِ", "يَقْرَأُ كِتَابًا كُلَّ يَوْمٍ", "سَأَقْرَأُ كِتَابًا غَدًا"], 0),
    q("Sentence Formation", "hard", "Which sentence correctly negates 'أَذْهَبُ إِلَى السُّوقِ'?",
      ["لَا أَذْهَبُ إِلَى السُّوقِ", "لَمْ أَذْهَبُ إِلَى السُّوقِ", "مَا أَذْهَبَ إِلَى السُّوقِ", "لَنْ أَذْهَبُ إِلَى السُّوقِ"], 0),

    q("Nouns & Adjectives", "medium", "What is the plural of كِتَاب?", ["كُتُب", "كِتَابَات", "كِتَابُون", "كِتَابِين"], 0),
    q("Nouns & Adjectives", "medium", "What is the plural of رَجُل?", ["رِجَال", "رَجُلُونَ", "رَجُلَات", "رَاجِلُونَ"], 0),
    q("Nouns & Adjectives", "medium", "Which adjective agrees with 'مَدْرَسَة'?", ["كَبِيرَة", "كَبِير", "كِبَار", "أَكْبَر"], 0),
    q("Nouns & Adjectives", "hard", "Which phrase means 'the man's house'?",
      ["بَيْتُ الرَّجُلِ", "الْبَيْتُ رَجُلٌ", "بَيْتٌ وَرَجُلٌ", "رَجُلُ الْبَيْتِ"], 0),
    q("Nouns & Adjectives", "medium", "Which word is dual (exactly two)?", ["كِتَابَانِ", "كُتُب", "كِتَاب", "كِتَابَات"], 0),
    q("Nouns & Adjectives", "easy", "Which pronoun means 'they' for two people?", ["هُمَا", "هُمْ", "هُوَ", "هُنَّ"], 0),
]

# ===========================================================================
# POST-FOUNDATION S3 — grammar and reading comprehension
# ===========================================================================
_P1 = "فِي الصَّبَاحِ، يَذْهَبُ أَحْمَدُ إِلَى الْمَدْرَسَةِ. هُوَ يُحِبُّ الْقِرَاءَةَ، وَيَقْرَأُ كِتَابًا جَدِيدًا كُلَّ أُسْبُوعٍ."
_P2 = "تَعْمَلُ فَاطِمَةُ فِي مُسْتَشْفَى قَرِيبٍ مِنْ بَيْتِهَا. تَبْدَأُ عَمَلَهَا فِي السَّاعَةِ الثَّامِنَةِ وَتَعُودُ فِي الْمَسَاءِ."
_P3 = "الْجَوُّ الْيَوْمَ بَارِدٌ، لِذَلِكَ لَبِسَ الْأَوْلَادُ مَعَاطِفَهُمْ قَبْلَ الْخُرُوجِ إِلَى الْحَدِيقَةِ."

AA_S3 = [
    q("Grammar", "medium", "'بَيْتُ الرَّجُلِ' is an example of:",
      ["Idafa (a possessive construction)", "a verbal sentence", "a conditional sentence", "a passive verb"], 0),
    q("Grammar", "medium", "'الطَّالِبُ مُجْتَهِدٌ' is which kind of sentence?",
      ["A nominal sentence (jumla ismiyya)", "A verbal sentence (jumla fi'liyya)", "A conditional sentence", "A question"], 0),
    q("Grammar", "easy", "'سَوْفَ أُسَافِرُ غَدًا' refers to:", ["The future", "The past", "The present", "A command"], 0),
    q("Grammar", "hard", "In 'قَرَأَ الطَّالِبُ الْكِتَابَ', which word is the object?",
      ["الْكِتَابَ", "الطَّالِبُ", "قَرَأَ", "الْقِرَاءَةُ"], 0),
    q("Grammar", "hard", "Which sentence uses the passive voice?",
      ["كُتِبَ الدَّرْسُ", "كَتَبَ الطَّالِبُ الدَّرْسَ", "يَكْتُبُ الطَّالِبُ الدَّرْسَ", "سَيَكْتُبُ الدَّرْسَ"], 0, audience="adults"),
    q("Grammar", "medium", "Which word makes the sentence negative in the past: '___ يَذْهَبْ إِلَى السُّوقِ'?",
      ["لَمْ", "لَا", "لَنْ", "مَا زَالَ"], 0),
    q("Grammar", "medium", "Which pronoun fits: '___ طَالِبَةٌ فِي الْجَامِعَةِ'?", ["هِيَ", "هُوَ", "هُمْ", "أَنْتَ"], 0),
    q("Grammar", "hard", "Which comparative form means 'bigger'?", ["أَكْبَر", "كَبِير", "كُبْرَى", "كِبَار"], 0, audience="adults"),

    q("Reading Comprehension", "medium", "Read the paragraph. Where does Ahmad go in the morning?",
      ["To school", "To the mosque nearby", "To the market with his father", "To his grandmother's house"], 0, arabic=_P1),
    q("Reading Comprehension", "medium", "Read the paragraph. How often does Ahmad read a new book?",
      ["Every week", "Every single day", "Once every month", "The text does not say"], 0, arabic=_P1),
    q("Reading Comprehension", "medium", "Read the paragraph. Where does Fatimah work?",
      ["In a hospital", "In a primary school", "In a small market", "At home, on her own"], 0, arabic=_P2),
    q("Reading Comprehension", "medium", "Read the paragraph. When does Fatimah start work?",
      ["At eight o'clock", "At seven o'clock", "Late in the evening", "Just after lunch"], 0, arabic=_P2),
    q("Reading Comprehension", "hard", "Read the paragraph. What does it say about the hospital?",
      ["It is near her house", "It is far from her house", "It has just opened", "It is very large"], 0, arabic=_P2, audience="adults"),
    q("Reading Comprehension", "medium", "Read the sentence. Why did the children put on their coats?",
      ["Because the weather is cold", "Because it started raining", "Because they were going to school", "Because it was already night"], 0, arabic=_P3),
    q("Reading Comprehension", "medium", "Read the sentence. Where were the children going?",
      ["To the garden", "To the school", "To the market", "To their room"], 0, arabic=_P3, audience="kids"),
    q("Reading Comprehension", "medium", "In this sentence, which word is closest in meaning to 'يُحِبُّ'?",
      ["يُفَضِّلُ (prefers)", "يَكْرَهُ (hates)", "يَنْسَى (forgets)", "يَبِيعُ (sells)"], 0, arabic="هُوَ يُحِبُّ الْقِرَاءَةَ."),
    q("Reading Comprehension", "hard", "In this sentence, what does 'لِذَلِكَ' show?",
      ["A result", "A contrast", "A condition", "A point in time"], 0, arabic="الْجَوُّ بَارِدٌ، لِذَلِكَ لَبِسْتُ مِعْطَفِي.", audience="adults"),
    q("Reading Comprehension", "medium", "What does 'لَمْ يَجِدْهُ' mean?",
      ["He did not find it", "He will find it", "He found it", "He is looking for it"], 0),
    q("Reading Comprehension", "easy", "What does 'بَعْدَ قَلِيلٍ' mean?", ["In a little while", "A long time ago", "Every day", "Never"], 0),
    q("Reading Comprehension", "hard", "What does 'مَا زَالَ يَعْمَلُ' mean?",
      ["He is still working", "He stopped working", "He will work", "He worked once"], 0),
]

# ===========================================================================
# POST-FOUNDATION S4 — advanced reading and expression
# ===========================================================================
_P4 = ("زَارَ خَالِدٌ الْمَكْتَبَةَ الْعَامَّةَ لِيَسْتَعِيرَ كِتَابًا عَنْ تَارِيخِ الْأَنْدَلُسِ، "
       "لَكِنَّهُ لَمْ يَجِدْهُ، فَقَرَّرَ أَنْ يَشْتَرِيَهُ مِنَ الْمَكْتَبَةِ الْمُجَاوِرَةِ.")
_P5 = ("تُعَدُّ الْقِرَاءَةُ مِنْ أَفْضَلِ الْعَادَاتِ الْيَوْمِيَّةِ، فَهِيَ تُوَسِّعُ الْمَعْرِفَةَ "
       "وَتُقَوِّي اللُّغَةَ، وَلَا تَحْتَاجُ إِلَى أَكْثَرَ مِنْ بِضْعِ دَقَائِقَ كُلَّ يَوْمٍ.")
_P6 = "الطَّقْسُ الْيَوْمَ مُشْمِسٌ وَجَمِيلٌ، وَلَكِنَّهُ بَارِدٌ قَلِيلًا."

AA_S4 = [
    q("Advanced Reading", "medium", "Read the sentence. What is being described?",
      ["The weather today", "A book he just read", "A trip with family", "A lesson at school"], 0, arabic=_P6),
    q("Advanced Reading", "hard", "Read the paragraph. Why did Khalid go to the library?",
      ["To borrow a book on the history of al-Andalus", "To meet a friend who works there",
       "To return a book he had borrowed", "To study for an important exam"], 0, arabic=_P4),
    q("Advanced Reading", "hard", "Read the paragraph. What did Khalid decide in the end?",
      ["To buy the book from the shop next door", "To wait until next week", "To read a different book", "To ask the librarian for help"], 0, arabic=_P4),
    q("Advanced Reading", "hard", "Read the paragraph. What is the writer's main point?",
      ["Reading is a valuable daily habit", "Books have become expensive", "Reading is hard for beginners", "Libraries should open longer"], 0, arabic=_P5),
    q("Advanced Reading", "hard", "Read the paragraph. According to the writer, how much time does reading need?",
      ["A few minutes a day", "About two hours a day", "A whole evening", "It does not say"], 0, arabic=_P5),
    q("Advanced Reading", "hard", "Read this sentence without vowel marks. What does it mean?",
      ["The library is open today", "The library is closed today", "The new book has arrived", "The lesson is difficult"], 0, arabic="المكتبة مفتوحة اليوم."),
    q("Advanced Reading", "medium", "Read this sentence without vowel marks. What does it mean?",
      ["The students went to the class", "The students left the class", "The teacher entered the class", "The class is empty"], 0,
      arabic="ذهب الطلاب إلى الفصل."),

    q("Expression", "medium", "'بِالرَّغْمِ مِنْ' means:", ["In spite of", "Because of", "Instead of", "In front of"], 0),
    q("Expression", "medium", "Which connector means 'however'?", ["لَكِنَّ", "لِأَنَّ", "لِذَلِكَ", "كَذَلِكَ"], 0),
    q("Expression", "medium", "Which connector shows a reason?", ["لِأَنَّ", "لَكِنَّ", "ثُمَّ", "أَيْضًا"], 0),
    q("Expression", "medium", "Which connector shows a result?", ["لِذَلِكَ", "لِأَنَّ", "بَيْنَمَا", "مِثْلَ"], 0),
    q("Expression", "hard", "In a formal letter, which opening is appropriate?",
      ["تَحِيَّةً طَيِّبَةً وَبَعْدُ", "مَرْحَبًا يَا صَاحِبِي", "كَيْفَ الْحَالُ يَا شَبَاب", "سَلَام"], 0, audience="adults"),
    q("Expression", "hard", "Which sentence is the most formal way to make a request?",
      ["أَرْجُو التَّكَرُّمَ بِالْمُوَافَقَةِ", "أَعْطِنِي هَذَا الْكِتَابَ الْآنَ",
       "أُرِيدُ ذَلِكَ فِي هَذِهِ اللَّحْظَةِ", "هَلْ عِنْدَكَ وَقْتٌ لِي الْيَوْمَ؟"], 0, audience="adults"),
    q("Expression", "easy", "Which phrase means 'for example'?", ["عَلَى سَبِيلِ الْمِثَالِ", "فِي النِّهَايَةِ", "مِنْ نَاحِيَةٍ أُخْرَى", "بِشَكْلٍ عَامٍّ"], 0),
    q("Expression", "hard", "'مِنْ نَاحِيَةٍ أُخْرَى' is used to:",
      ["introduce another side of an argument", "introduce an example of the point",
       "bring a paragraph to a conclusion", "express agreement with the writer"], 0, audience="adults"),

    q("Advanced Grammar", "hard", "Which sentence uses the passive voice?",
      ["فُتِحَ الْبَابُ", "فَتَحَ الْوَلَدُ الْبَابَ", "يَفْتَحُ الْبَابَ", "سَيَفْتَحُ الْبَابَ"], 0),
    q("Advanced Grammar", "hard", "Which sentence contains a conditional?",
      ["إِنْ تَدْرُسْ تَنْجَحْ", "دَرَسَ فَنَجَحَ", "يَدْرُسُ وَيَنْجَحُ", "نَجَحَ بَعْدَ الدِّرَاسَةِ"], 0),
    q("Advanced Grammar", "hard", "In 'الْكِتَابُ الَّذِي قَرَأْتُهُ مُفِيدٌ', what does 'الَّذِي' do?",
      ["It links a description to 'الْكِتَابُ'", "It makes the sentence negative",
       "It turns the sentence into a question", "It marks the verb as past tense"], 0, audience="adults"),
    q("Advanced Grammar", "medium", "Which word is a masdar (verbal noun)?", ["الْقِرَاءَة", "يَقْرَأُ", "قَارِئ", "مَقْرُوء"], 0),
    q("Advanced Grammar", "hard", "Which sentence expresses an obligation?",
      ["يَجِبُ أَنْ أَدْرُسَ", "أُحِبُّ أَنْ أَدْرُسَ", "أَسْتَطِيعُ أَنْ أَدْرُسَ", "أُرِيدُ أَنْ أَدْرُسَ"], 0),
]
