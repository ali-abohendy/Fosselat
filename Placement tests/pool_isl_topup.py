# -*- coding: utf-8 -*-
"""
Top-up items for the Islamic Studies pools, so every stage offers at least 18
questions to each audience (the engine serves 10 to kids, 12 to adults, and
needs a real pool to draw from). Items tagged "both" count for both audiences.

The kids items lean on naming a concept ("what is it called when...") as well as
situations, because a run of pure "what should you do" scenarios lets a child
pick the kindest-sounding option without knowing the teaching.
"""


def q(skill, difficulty, prompt, options, correct, audience="both"):
    return dict(skill=skill, difficulty=difficulty, prompt=prompt, options=options,
                correct=correct, audience=audience, arabic=None)


IC_S1_EXTRA = [
    q("Pillars & Basics", "easy", "Which of these is one of the five pillars of Islam?",
      ["Zakah", "Wudu", "Adhan", "Tafsir"], 0),
    q("Prophet & Qur'an", "easy", "Which book was revealed to Prophet Muhammad ﷺ?",
      ["The Qur'an", "The Tawrah", "The Injil", "The Zabur"], 0),
    q("Prophet & Qur'an", "medium", "Who was the first prophet?", ["Adam", "Nuh", "Ibrahim", "Musa"], 0),
    q("Pillars & Basics", "easy", "How many daily prayers are obligatory?", ["Five", "Three", "Four", "Six"], 0),
]

IC_S2_EXTRA = [
    q("Belief", "medium", "Angels are best described as:",
      ["creations who always obey Allah", "prophets sent to people",
       "the souls of righteous people", "jinn who worship Allah"], 0),
    q("Belief", "medium", "Which prophet was given the Injil?", ["'Isa", "Musa", "Dawud", "Ibrahim"], 0),
    q("Worship", "medium", "Zakah becomes due on qualifying wealth once every:",
      ["lunar year", "month", "week", "five years"], 0),
    q("Belief", "medium", "The word 'Islam' means:",
      ["submission to Allah", "prayer", "a peace treaty", "a community"], 0),
]

IC_S3_EXTRA = [
    q("Qur'an Sciences", "medium", "Which science studies the meanings of the Qur'an?",
      ["Tafsir", "Tajweed", "Fiqh", "Seerah"], 0),
    q("Fiqh Concepts", "medium", "Which science studies the rulings of worship and daily life?",
      ["Fiqh", "Aqeedah", "Seerah", "Tajweed"], 0),
]

IC_S4_EXTRA = [
    q("Fiqh Concepts", "hard", "'Ijma'' refers to:",
      ["the agreement of the scholars on a ruling", "the considered opinion of one scholar",
       "the settled custom of a country", "a report narrated from a companion"], 0),
    q("Fiqh Concepts", "hard", "A 'fatwa' is:",
      ["a scholar's answer about a ruling", "a court sentence", "a Friday sermon", "a public announcement"], 0),
]

AQ_EXTRA_S1 = [
    q("Foundations of Belief", "medium", "Belief in the angels means believing that:",
      ["Allah created them and they obey Him", "they are the children of Allah",
       "they were prophets before Adam", "they decide what happens to people"], 0),
]
AQ_EXTRA_S2 = [
    q("Applied Aqeedah", "hard", "Believing that only Allah gives life and death is part of:",
      ["Tawheed ar-Ruboobiyyah", "Tawheed al-Uloohiyyah", "Tawheed al-Asma wa Sifat", "Al-Qadar"], 0),
]

FQ_EXTRA_S1 = [
    q("Worship Basics", "easy", "How many rak'ah are in the obligatory Maghrib prayer?", ["Three", "Two", "Four", "Five"], 0),
]
FQ_EXTRA_S2 = [
    q("Fasting", "medium", "A child forgets they are fasting and eats a little. What is the ruling?",
      ["The fast continues and is still valid", "The fast is broken and must be repeated",
       "The fast is broken but no repeat is needed", "They must fast two extra days"], 0, audience="kids"),
    q("Salah", "medium", "Someone speaks to you while you are praying. What should you do?",
      ["Continue praying and do not answer", "Answer quietly and continue",
       "Stop the prayer and answer", "Start the prayer again"], 0, audience="kids"),
    q("Purity", "medium", "You are unsure whether you still have wudu before praying. What is safest?",
      ["Make wudu again", "Pray without wudu", "Wait until the next prayer", "Make tayammum"], 0, audience="kids"),
]

HD_EXTRA_S1 = [
    q("Collections & Scholars", "medium", "Which companion is known for narrating the largest number of hadith?",
      ["Abu Hurairah", "Bilal", "Salman al-Farisi", "Abu Bakr"], 0),
    q("Hadith Foundations", "medium", "A hadith records what the Prophet ﷺ said, did, or:",
      ["approved of", "wrote with his own hand", "saw in a dream", "taught only his family"], 0),
]
HD_EXTRA_S2 = [
    q("Grading Hadith", "hard", "Two chains for one hadith are each slightly weak, but they support each other. The hadith may be graded:",
      ["hasan through supporting chains", "sahih without discussion", "mawdu'", "mutawatir"], 0),
]

SR_EXTRA_S2 = [
    q("Dates & Timeline", "medium", "Which of these battles happened first?", ["Badr", "Uhud", "Al-Khandaq", "Khaybar"], 0, audience="kids"),
    q("Historical Understanding", "medium", "Why did the Prophet ﷺ and his companions leave Makkah for Madinah?",
      ["They were being harmed for their faith", "To trade with the tribes there",
       "To visit relatives", "Because of a famine in Makkah"], 0, audience="kids"),
]

TF_EXTRA_S2 = [
    q("Applied Tafsir", "medium", "Why do we need tafsir?",
      ["Some verses need explaining to be understood properly", "The Qur'an is written in another language",
       "It shortens the Qur'an", "It replaces reading the Qur'an"], 0, audience="kids"),
    q("Revelation Context", "easy", "Surahs revealed before the Hijrah are called:", ["Makki", "Madani", "Qudsi", "Sunni"], 0, audience="kids"),
    q("Applied Tafsir", "medium", "The story of Prophet Yunus teaches us mainly about:",
      ["turning back to Allah", "how to build ships", "farming the land", "trading fairly"], 0, audience="kids"),
    q("Applied Tafsir", "medium", "When we study the tafsir of a surah, we learn:",
      ["what its verses mean", "how to recite it quickly", "how many letters it has", "what time of day to read it"], 0, audience="kids"),
]

MN_EXTRA_S2 = [
    q("Character Terms", "easy", "What is it called when you talk about someone's faults behind their back?",
      ["Ghibah", "Sabr", "Amanah", "Sidq"], 0, audience="kids"),
    q("Character Terms", "easy", "What is it called when you look after something someone lent you?",
      ["Amanah", "Ghibah", "Hasad", "Kibr"], 0, audience="kids"),
    q("Character Terms", "easy", "What is it called when you always tell the truth?",
      ["Sidq", "Sabr", "Shukr", "Amanah"], 0, audience="kids"),
    q("Character Terms", "medium", "What is it called when you thank Allah for what you have?",
      ["Shukr", "Sabr", "Sidq", "Amanah"], 0, audience="kids"),
    q("Character Terms", "medium", "What is it called when you want what someone else has and wish they lost it?",
      ["Hasad", "Shukr", "Sabr", "Sidq"], 0, audience="kids"),
    q("Applying Character", "medium", "You borrowed a friend's book and it got torn. What is best?",
      ["Tell them and offer to replace it", "Return it and say nothing",
       "Say it was already torn", "Keep the book instead"], 0, audience="kids"),
    q("Applying Character", "medium", "Your friend wins the race and you lose. What is the best manner?",
      ["Congratulate them", "Say the race was unfair", "Refuse to play next time", "Walk away without speaking"], 0, audience="kids"),
    q("Applying Character", "medium", "Someone says something unkind to you at school. Which reply shows good character?",
      ["Answer politely and walk away", "Say something worse back",
       "Tell everyone what they said", "Never speak to them again"], 0, audience="kids"),
]

EXTRAS = {
    "IC_S1": IC_S1_EXTRA, "IC_S2": IC_S2_EXTRA, "IC_S3": IC_S3_EXTRA, "IC_S4": IC_S4_EXTRA,
    "AQ_S1": AQ_EXTRA_S1, "AQ_S2": AQ_EXTRA_S2,
    "FQ_S1": FQ_EXTRA_S1, "FQ_S2": FQ_EXTRA_S2,
    "HD_S1": HD_EXTRA_S1, "HD_S2": HD_EXTRA_S2,
    "SR_S2": SR_EXTRA_S2, "TF_S2": TF_EXTRA_S2, "MN_S2": MN_EXTRA_S2,
}
