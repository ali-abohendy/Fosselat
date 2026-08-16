# -*- coding: utf-8 -*-
"""Seerah, Tafsir and Manners question pools."""

def q(skill, difficulty, prompt, options, correct, audience="both"):
    return dict(skill=skill, difficulty=difficulty, prompt=prompt, options=options,
                correct=correct, audience=audience, arabic=None)


# =========================================================================
# SEERAH — STAGE 1 : KEY EVENTS & PEOPLE
# =========================================================================

SR_S1 = [

    q("Key People", "easy",
      "Who was the first wife of the Prophet Muhammad ﷺ?",
      ["Khadijah bint Khuwaylid", "Fatimah bint Muhammad",
       "Aisha bint Abi Bakr", "Hafsah bint Umar"], 0),

    q("Early Life", "easy",
      "In which city was the Prophet Muhammad ﷺ born?",
      ["Ta'if", "Makkah", "Madinah", "Khaybar"], 1, "kids"),

    q("Key People", "easy",
      "What was the name of the mother of the Prophet ﷺ?",
      ["Barakah, known as Umm Ayman", "Halimah as-Sa'diyyah",
       "Fatimah bint Asad", "Aminah bint Wahb"], 3),

    q("Early Life", "medium",
      "The people of Makkah gave the Prophet ﷺ a title before he received "
      "revelation, because of the way he dealt with them. What was it?",
      ["Al-Amin, the trustworthy", "Al-Karim, the generous",
       "Al-Hakim, the wise", "As-Sabur, the patient"], 0, "kids"),

    q("Key People", "medium",
      "After the death of his grandfather, who took the young Prophet ﷺ into "
      "his care?",
      ["His uncle Hamzah", "His uncle Abu Talib", "His uncle Al-'Abbas",
       "His uncle Abu Lahab"], 1),

    q("Key Events", "easy",
      "Where was the Prophet ﷺ when the first revelation came to him?",
      ["In the cave of Thawr", "On the hill of Safa", "In the cave of Hira",
       "Inside the Ka'bah"], 2),

    q("Key Events", "medium",
      "Which angel brought the revelation to the Prophet ﷺ?",
      ["Malik", "Mika'il", "Israfil", "Jibril"], 3),

    q("Key Events", "hard",
      "Which words were the first to be revealed to the Prophet ﷺ?",
      ["Iqra' bismi Rabbika alladhi khalaq",
       "Ya ayyuha al-muddaththir qum fa-andhir",
       "Al-hamdu lillahi Rabbi al-'alamin", "Qul huwa Allahu ahad"],
      0, "adults"),

    q("Key Events", "medium",
      "How old was the Prophet ﷺ when the first revelation came to him?",
      ["Twenty-five years", "Thirty years", "Forty years", "Fifty years"], 2),

    q("Key People", "hard",
      "Among the free adult men of Makkah, who was the first to accept Islam?",
      ["Umar ibn al-Khattab", "Abu Bakr as-Siddiq", "Uthman ibn Affan",
       "Talhah ibn Ubaydullah"], 1, "adults"),

    q("Key People", "medium",
      "Among the children of Makkah, who was the first to accept Islam?",
      ["Zayd ibn Harithah", "Anas ibn Malik", "Ali ibn Abi Talib",
       "Abdullah ibn Mas'ud"], 2),

    q("Companions", "easy",
      "Which companion was the first to call the adhan for the Muslims?",
      ["Ammar ibn Yasir", "Salman al-Farisi", "Suhayb ar-Rumi",
       "Bilal ibn Rabah"], 3, "kids"),

    q("Key People", "easy",
      "Which daughter of the Prophet ﷺ was married to Ali ibn Abi Talib?",
      ["Fatimah", "Ruqayyah", "Zaynab", "Umm Kulthum"], 0, "kids"),

    q("Early Life", "hard",
      "What work did the Prophet ﷺ do for Khadijah before their marriage?",
      ["He managed her orchards outside Makkah",
       "He led her trading caravans to Sham",
       "He guarded her house and her property",
       "He taught writing to her household"], 1, "adults"),

    q("Early Life", "medium",
      "Who nursed the Prophet ﷺ among the desert tribe when he was an infant?",
      ["Fatimah bint Asad", "Aminah bint Wahb", "Halimah as-Sa'diyyah",
       "Safiyyah bint Abd al-Muttalib"], 2, "kids"),

    q("Key Events", "easy",
      "Who cared for the Prophet ﷺ immediately after his mother died?",
      ["His brother-in-law Abu al-'As", "His father Abdullah",
       "His cousin Ja'far", "His grandfather Abd al-Muttalib"], 3, "kids"),

    q("Key Events", "medium",
      "Where did a group of early Muslims take refuge from persecution before "
      "the migration to Madinah?",
      ["Abyssinia, the land of the Negus", "Ta'if, the town of Thaqif",
       "Yemen, the land of Himyar", "Sham, the land of the Ghassan"],
      0, "adults"),

    q("Key Events", "hard",
      "The Prophet ﷺ travelled to Ta'if seeking support for his message. What "
      "was the outcome of that journey?",
      ["Its leaders accepted Islam and sent him support",
       "Its leaders refused him and he was driven out",
       "Its leaders agreed a truce with the Quraysh",
       "Its leaders offered him rule over the town"], 1, "adults"),

    q("Key Events", "hard",
      "The Quraysh imposed a boycott on the Banu Hashim for about three "
      "years. What did that boycott consist of?",
      ["A ban on them approaching the Ka'bah at Hajj",
       "A tax paid by them for every entry into Makkah",
       "A ban on trading with them or marrying into them",
       "An order removing them from the Arabian Peninsula"], 2, "adults"),

    q("Key People", "hard",
      "After the first revelation, Khadijah took the Prophet ﷺ to a relative "
      "of hers to hear what had happened. Who was that?",
      ["Abu Talib, his uncle and protector in Makkah",
       "Zayd ibn Amr, who had turned away from the idols",
       "Abd al-Muttalib, the elder of the Banu Hashim",
       "Waraqah ibn Nawfal, who knew the earlier scriptures"], 3, "adults"),

    q("Migration", "medium",
      "Why did the Muslims leave Makkah for Madinah?",
      ["To escape persecution and live where Islam could be practised freely",
       "To trade with the northern tribes and grow wealthier",
       "To join the Christian king who had sheltered earlier emigrants",
       "To perform the pilgrimage away from the eyes of the Quraysh"], 0),

    q("Migration", "medium",
      "Who travelled with the Prophet ﷺ on the migration to Madinah?",
      ["Umar ibn al-Khattab", "Abu Bakr as-Siddiq", "Uthman ibn Affan",
       "Abd ar-Rahman ibn Awf"], 1),

    q("Migration", "medium",
      "In which cave did the Prophet ﷺ and his companion hide during the "
      "journey to Madinah?",
      ["The cave of Hira", "The cave of Uhud", "The cave of Thawr",
       "The cave of Quba"], 2),

    q("Migration", "medium",
      "On the night of the migration, Ali ibn Abi Talib lay down in the bed "
      "of the Prophet ﷺ. Why?",
      ["So that the family of the Prophet ﷺ would not be left alone",
       "So that thieves would not enter the house once it was empty",
       "So that he could set out with the Prophet ﷺ the next morning",
       "So the watchers outside would think he was still at home"], 3, "kids"),

    q("Migration", "hard",
      "Which masjid did the Prophet ﷺ build first after leaving Makkah?",
      ["Masjid Quba", "Masjid an-Nabawi", "Masjid al-Qiblatayn",
       "Masjid al-Jumu'ah"], 0, "adults"),

    q("Migration", "medium",
      "What name was given to the Muslims of Madinah who received the "
      "emigrants into their homes?",
      ["The Muhajirun", "The Ansar", "The Tabi'un", "The Siddiqun"], 1),

]


# =========================================================================
# SEERAH — STAGE 2 : ANALYTICAL SEERAH
# =========================================================================

SR_S2 = [

    q("Dates & Sequence", "easy",
      "In which year after the hijrah did the Battle of Badr take place?",
      ["1 AH", "2 AH", "3 AH", "5 AH"], 1),

    q("Dates & Sequence", "easy",
      "In which year after the hijrah did the Battle of Uhud take place?",
      ["2 AH", "3 AH", "4 AH", "6 AH"], 1),

    q("Dates & Sequence", "medium",
      "In which year after the hijrah was the Battle of the Trench fought?",
      ["3 AH", "4 AH", "5 AH", "6 AH"], 2),

    q("Dates & Sequence", "medium",
      "In which year after the hijrah was the Treaty of Hudaybiyyah "
      "concluded?",
      ["5 AH", "6 AH", "7 AH", "8 AH"], 1, "adults"),

    q("Dates & Sequence", "easy",
      "In which year after the hijrah was Makkah opened to the Muslims?",
      ["6 AH", "7 AH", "8 AH", "10 AH"], 2, "kids"),

    q("Dates & Sequence", "easy",
      "The migration of the Muslims from Makkah to Madinah is counted as "
      "which year of the Islamic calendar?",
      ["Year 1 AH", "Year 5 AH", "Year 10 AH", "Year 13 AH"], 0, "kids"),

    q("Dates & Sequence", "medium",
      "Of the following, which event took place LAST?",
      ["The Battle of Badr", "The Battle of Uhud", "The Battle of the Trench",
       "The expedition to Tabuk"], 3, "adults"),

    q("Dates & Sequence", "hard",
      "Which of these events falls between the Battle of Uhud and the Treaty "
      "of Hudaybiyyah?",
      ["The Battle of the Trench", "The Battle of Badr",
       "The opening of Makkah", "The Farewell Hajj"], 0, "adults"),

    q("Battles", "easy",
      "The Battle of the Trench takes its Arabic name, al-Khandaq, from what?",
      ["A shield", "A mountain", "A marketplace", "A trench"], 3, "kids"),

    q("Battles", "easy",
      "How did the two armies compare in size at the Battle of Badr?",
      ["About 300 Muslims against about 1,000 Quraysh",
       "About 1,000 Muslims against about 300 Quraysh",
       "About 3,000 Muslims against about 10,000 Quraysh",
       "About 700 Muslims against about 700 Quraysh"], 0, "kids"),

    q("Battles", "easy",
      "In which battle was the Prophet ﷺ himself wounded and one of his teeth "
      "broken?",
      ["Badr", "The Trench", "Uhud", "Hunayn"], 2, "kids"),

    q("Battles", "medium",
      "What defence did the Muslims prepare around Madinah in 5 AH, and who "
      "proposed it?",
      ["A fortified masjid, proposed by Sa'd ibn Mu'adh",
       "A stone wall, proposed by Abu Bakr as-Siddiq",
       "A cavalry raid, proposed by Khalid ibn al-Walid",
       "A trench, proposed by Salman al-Farisi"], 3),

    q("Battles", "hard",
      "Why is the expedition to Tabuk remembered as an especially hard test "
      "for the Muslims?",
      ["It was undertaken in severe heat with scarce provisions",
       "It was fought against a far larger Persian force",
       "It followed straight after a heavy defeat in the field",
       "It required crossing the sea to reach the enemy"], 0, "adults"),

    q("Lessons & Significance", "medium",
      "What did the outcome of Badr establish for the Muslim community?",
      ["That the fighting between them and the Quraysh had ended",
       "That a small believing force could overcome a larger army",
       "That the Ka'bah was now open to them for pilgrimage",
       "That the tribes of Madinah had entered a single treaty"], 1),

    q("Lessons & Significance", "medium",
      "The archers left their position on the hill at Uhud, and the course of "
      "the battle turned. Which lesson do the sources draw from this?",
      ["That numbers decide a battle more than any planning",
       "That believers are promised victory whenever they are sincere",
       "That obedience to the commander is not set aside for spoils",
       "That a position on a hill is unsafe in any engagement"], 2),

    q("Lessons & Significance", "hard",
      "The Muslims were a large force at the start of Hunayn, yet the opening "
      "of the battle went against them. What lesson is drawn from this?",
      ["That a treaty should precede every military expedition",
       "That cavalry is of little use in narrow valley ground",
       "That a commander should not take part in the fighting",
       "That numbers bring no victory without reliance upon Allah"],
      3, "adults"),

    q("Lessons & Significance", "medium",
      "What did the Prophet ﷺ do at the Ka'bah on the day Makkah was opened?",
      ["He removed the idols set around and inside it",
       "He rebuilt it upon the foundations of Ibrahim",
       "He moved the Black Stone to a different corner",
       "He appointed the Ansar as its permanent keepers"], 0),

    q("Lessons & Significance", "medium",
      "What changed among the Arabian tribes after Makkah was opened?",
      ["The Quraysh moved their leadership to Ta'if",
       "The tribes came in large numbers to accept Islam",
       "Makkah replaced Madinah as the seat of government",
       "The pilgrimage was suspended for the following two years"],
      1, "adults"),

    q("Lessons & Significance", "hard",
      "Why did the Prophet ﷺ send Mus'ab ibn Umayr to Yathrib before the "
      "migration?",
      ["To negotiate a truce with the tribes settled there",
       "To buy the ground on which the masjid would be built",
       "To teach Islam and prepare its people for what was coming",
       "To lead the emigrants who had already reached the city"], 2, "adults"),

    q("Treaties & Covenants", "hard",
      "Hudaybiyyah looked to many companions like a setback at the time. Why "
      "do the sources treat it as a clear opening?",
      ["It placed the Ka'bah under Muslim control at once",
       "It removed the need for any further expeditions",
       "It obliged the Quraysh to accept Islam within ten years",
       "It brought a truce in which Islam spread openly and widely"],
      3, "adults"),

    q("Treaties & Covenants", "medium",
      "What did the Treaty of Hudaybiyyah require the Muslims to do that "
      "year?",
      ["Return to Madinah and perform 'Umrah the following year",
       "Enter Makkah for 'Umrah and remain for ten days",
       "Receive the keys of the Ka'bah from the Quraysh",
       "Send a delegation to live among the Quraysh"], 0),

    q("Treaties & Covenants", "medium",
      "What did the document the Prophet ﷺ drew up on reaching Madinah mainly "
      "do?",
      ["It set fixed prices and rules for the city's market",
       "It defined the duties of the tribes, Jews included, as one community",
       "It made acceptance of Islam a condition of residence",
       "It fixed the yearly zakah owed by each tribe of the city"], 1),

    q("Treaties & Covenants", "hard",
      "Under that Madinah covenant, what were the parties bound to do if the "
      "city came under attack?",
      ["Each group would defend its own quarter by itself",
       "They would request the help of the Quraysh of Makkah",
       "They would defend the city jointly against the attacker",
       "They would withdraw until the attacking force left"], 2, "adults"),

    q("Farewell Sermon", "medium",
      "Which theme runs through the Farewell Sermon?",
      ["The appointment of a ruler to succeed him",
       "The permission to move the sacred months when needed",
       "The obligation to fight every neighbouring people",
       "The inviolability of Muslim life, property and honour"], 3),

    q("Farewell Sermon", "easy",
      "In the Farewell Sermon the Prophet ﷺ said that no Arab is above a "
      "non-Arab, and no white above a black, except by what?",
      ["Taqwa", "Lineage", "Wealth", "Age"], 0, "kids"),

    q("Farewell Sermon", "hard",
      "What did the Prophet ﷺ declare in the Farewell Sermon about the "
      "practices of the days of ignorance, such as blood revenge and riba?",
      ["That they were permitted for one further year",
       "That they were placed beneath his feet and abolished",
       "That each tribe would decide upon them itself",
       "That they applied henceforth to non-Muslims only"], 1, "adults"),

]


# =========================================================================
# TAFSIR — STAGE 1 : TAFSIR FOUNDATIONS
# =========================================================================

TF_S1 = [

    q("What is Tafsir", "easy",
      "What does the word tafsir refer to?",
      ["Explaining the meaning of the Qur'an",
       "Reciting the Qur'an with tajwid", "Committing the Qur'an to memory",
       "Writing the Qur'an in Arabic script"], 0),

    q("What is Tafsir", "medium",
      "Why do Muslims study tafsir rather than relying on a translation "
      "alone?",
      ["Because translations of the Qur'an are unlawful to read",
       "Because a translation cannot fully carry context, wording and rulings",
       "Because the meaning of the Qur'an changes in every generation",
       "Because only Arabic speakers are obliged to act on the Qur'an"], 1),

    q("What is Tafsir", "medium",
      "Which is the strongest basis for explaining a verse of the Qur'an?",
      ["The custom of the country in which the reader lives",
       "The impression the reader forms at the time of reading",
       "Another verse of the Qur'an, or the Sunnah of the Prophet ﷺ",
       "A poem from before Islam that uses the same word"], 2, "adults"),

    q("What is Tafsir", "hard",
      "A person explains a verse purely from his own opinion, with no "
      "knowledge of Arabic and no reference to the narrated reports. How is "
      "this regarded?",
      ["The method followed by the companions",
       "Acceptable, provided that he is sincere",
       "Required of every reader of the Qur'an",
       "Blameworthy, and not accepted as tafsir"], 3, "adults"),

    q("What is Tafsir", "medium",
      "Two students disagree about what a verse means. What is the sound way "
      "to settle the disagreement?",
      ["Ask a teacher who knows what the scholars have said about it",
       "Take the meaning that the greater number of them prefer",
       "Take the meaning that is easier for them to act upon",
       "Let each of them keep the meaning that occurred to him"], 0, "kids"),

    q("Surah Themes", "easy",
      "What is Surah al-Ikhlas mainly about?",
      ["The story of the elephant", "The oneness of Allah",
       "Seeking refuge from evil", "The value of time"], 1),

    q("Surah Themes", "easy",
      "Surah al-Fil speaks about which event?",
      ["The digging of the well of Zamzam",
       "The winter and summer journeys of the Quraysh",
       "An army that came to destroy the Ka'bah",
       "The night the Prophet ﷺ left Makkah"], 2, "kids"),

    q("Surah Themes", "hard",
      "What is the central lesson that Surah al-Fil sets before its reader?",
      ["That the people of Makkah were punished for their idols",
       "That the use of animals in war was made unlawful",
       "That the Quraysh earned safety through their trading",
       "That Allah defends His sacred House against any power"], 3, "adults"),

    q("Surah Themes", "medium",
      "Surah al-'Asr names what saves a person from loss. Which set does it "
      "mention?",
      ["Faith, righteous deeds, urging truth and urging patience",
       "Prayer, fasting, charity and pilgrimage performed regularly",
       "Knowledge, wealth, sound health and a righteous family",
       "Courage, generosity, modesty and love of one's people"], 0),

    q("Surah Themes", "medium",
      "Whom does Surah al-Ma'un describe with censure?",
      ["One who gives charity openly so that people will praise him",
       "One who prays while heedless of his prayer and repels the orphan",
       "One who consumes the wealth of merchants and leaves debts unpaid",
       "One who recites the Qur'an without understanding its meaning"], 1),

    q("Surah Themes", "medium",
      "What is the message of Surah al-Kafirun?",
      ["That Muslims may share in others' worship on set occasions",
       "That disbelievers are forgiven if they respect the Muslims",
       "That worship is not to be mixed: to them theirs, to me mine",
       "That Muslims should not speak with people of other faiths"], 2),

    q("Surah Themes", "medium",
      "Surah al-Kawthar came at a time of difficulty for the Prophet ﷺ. What "
      "does it convey to him?",
      ["A promise of wealth and standing among the Quraysh",
       "A command to fight those who had insulted him in Makkah",
       "An instruction to leave Makkah and preach in Ta'if instead",
       "Abundant good for him, and an answer to the one who taunted him"], 3),

    q("Surah Themes", "easy",
      "What do Surah al-Falaq and Surah an-Nas both teach us to do?",
      ["Seek protection with Allah from harm", "Give thanks to Allah for food",
       "Learn the names of the prophets", "Be gentle with our parents"],
      0, "kids"),

    q("Surah Themes", "medium",
      "Surah an-Nas opens by seeking refuge with Allah under three "
      "descriptions. Which are they?",
      ["Creator, Sustainer and Provider", "Lord, King and God of mankind",
       "The First, the Last and the Everlasting",
       "The Merciful, the Kind and the Forgiving"], 1),

    q("Surah Themes", "easy",
      "Which is a central theme of Surah al-Fatihah?",
      ["The laws of inheritance between relatives",
       "A description of the gardens of Paradise",
       "Praise of Allah and the request for guidance",
       "The account of Musa and Pharaoh in Egypt"], 2),

    q("Surah Themes", "easy",
      "Which surah is recited in every rak'ah of every prayer?",
      ["Al-'Asr", "Al-Ikhlas", "An-Nas", "Al-Fatihah"], 3, "kids"),

    q("Central Message", "hard",
      "What does the statement of al-Fatihah, \"You alone we worship and You "
      "alone we ask for help\", establish?",
      ["That worship and the seeking of help belong to Allah alone",
       "That help may be sought from the righteous after their death",
       "That worship is valid only when performed in Arabic",
       "That every prayer must open with a supplication"], 0, "adults"),

    q("Central Message", "hard",
      "Surah al-Ikhlas was revealed in answer to something the idolaters had "
      "asked the Prophet ﷺ. What had they asked about?",
      ["The date on which the Last Day would fall",
       "The description and lineage of his Lord",
       "The reward awaiting the righteous in Paradise",
       "The names of the prophets sent before him"], 1, "adults"),

    q("Surah Themes", "hard",
      "Surah al-Kafirun answered a proposal the Quraysh had put to the "
      "Prophet ﷺ. What was that proposal?",
      ["That he cease preaching in exchange for wealth and rank",
       "That the Muslims pay a levy and keep their religion",
       "That each side worship the other's god in alternate years",
       "That the Muslims leave Makkah and settle in Ta'if"], 2, "adults"),

    q("Revelation Basics", "medium",
      "Over roughly how long a period was the Qur'an revealed?",
      ["Three years", "Ten years", "Forty years", "Twenty-three years"], 3),

    q("Revelation Basics", "medium",
      "How was the Qur'an sent down to the Prophet ﷺ?",
      ["Gradually, over many years, as events and needs arose",
       "Complete, on a single night, from beginning to end",
       "Written by the Prophet ﷺ himself as he received it",
       "In exactly the order in which it stands in the mushaf"], 0),

    q("Revelation Basics", "hard",
      "What was the benefit of the Qur'an being revealed in stages rather "
      "than all at once?",
      ["It let the Prophet ﷺ choose which rulings to announce",
       "It allowed it to be memorised and acted upon step by step",
       "It gave the companions room to add explanations between verses",
       "It kept the Quraysh from hearing of the message early"], 1, "adults"),

    q("Revelation Basics", "easy",
      "In which month did the revelation of the Qur'an begin?",
      ["Shawwal", "Muharram", "Ramadan", "Dhul-Hijjah"], 2, "kids"),

    q("Revelation Basics", "easy",
      "What is a surah?",
      ["A style of recitation", "A single verse of the Qur'an",
       "A collection of hadith", "A chapter of the Qur'an"], 3, "kids"),

    q("Revelation Basics", "medium",
      "How was the Qur'an preserved during the lifetime of the Prophet ﷺ?",
      ["By memorisation among the companions and writing by the scribes",
       "By a single written copy kept in the masjid of Madinah",
       "By translation into the languages of the neighbouring lands",
       "By recitation at the seasonal markets of the Arabian tribes"],
      0, "adults"),

]


# =========================================================================
# TAFSIR — STAGE 2 : THEMATIC & APPLIED TAFSIR
# =========================================================================

TF_S2 = [

    q("Asbab al-Nuzul", "easy",
      "What does the expression asbab al-nuzul refer to?",
      ["The circumstances in which verses were revealed",
       "The order of the surahs within the mushaf",
       "The rules governing recitation of the Qur'an",
       "The differences between the recognised qira'at"], 0),

    q("Asbab al-Nuzul", "medium",
      "How does knowing the occasion of revelation help a reader?",
      ["It fixes the order in which the surahs were arranged",
       "It clarifies the meaning and the ruling the verse intends",
       "It permits the reader to alter the wording when quoting",
       "It shows which verses were withdrawn by later revelation"], 1),

    q("Asbab al-Nuzul", "hard",
      "The principle al-'ibrah bi-'umum al-lafz la bi-khusus al-sabab means "
      "what?",
      ["The wording is general only when the occasion is unknown",
       "The ruling follows the particular occasion, not the general wording",
       "The ruling follows the general wording, not the particular occasion",
       "The occasion decides which of two readings is to be preferred"],
      2, "adults"),

    q("Asbab al-Nuzul", "medium",
      "Which statement about occasions of revelation is accurate?",
      ["Occasions are known only for verses containing rulings",
       "Every verse of the Qur'an has a recorded occasion",
       "Only Madani verses have occasions of revelation",
       "Many verses were revealed without any particular occasion"],
      3, "adults"),

    q("Asbab al-Nuzul", "hard",
      "A report giving the occasion of a verse reaches us only through a weak "
      "chain. How is it to be treated?",
      ["It is not relied upon to establish the meaning of the verse",
       "It is accepted, since reports of tafsir are not examined",
       "It is preferred over the apparent wording of the verse",
       "It is used when it agrees with the reader's own view"], 0, "adults"),

    q("Makki & Madani", "easy",
      "Which subjects do the Makki surahs characteristically emphasise?",
      ["The laws of inheritance, marriage contracts and warfare",
       "Tawhid, the resurrection and the accounts of earlier peoples",
       "The collection of zakah and the conduct of the hypocrites",
       "The treaties made with the tribes surrounding Madinah"], 1),

    q("Makki & Madani", "medium",
      "By the definition most widely accepted among scholars, a Madani surah "
      "is one revealed when?",
      ["During the years the Prophet ﷺ lived in either city",
       "Within the boundaries of the city of Madinah only",
       "After the hijrah, wherever it may have been revealed",
       "In the month of Ramadan while he was in Madinah"], 2, "adults"),

    q("Makki & Madani", "medium",
      "A surah addresses the People of the Book, lays down rules for "
      "fighting, and speaks of the hypocrites. What does this indicate?",
      ["That its classification cannot be determined",
       "That it is Makki in classification",
       "That it is among the earliest revelations",
       "That it is Madani in classification"], 3, "adults"),

    q("Makki & Madani", "medium",
      "Which of these is a sign that a surah was revealed at Makkah?",
      ["It calls people to one God and to belief in the Last Day",
       "It gives detailed rules for zakah and for inheritance",
       "It mentions the covenant with the tribes of Madinah",
       "It sets out how the spoils of war are to be divided"], 0, "kids"),

    q("Makki & Madani", "medium",
      "Surah al-Baqarah, with its rulings on fasting, debt and family life, "
      "is classified how?",
      ["Makki, being revealed before the hijrah",
       "Madani, being revealed after the hijrah",
       "Makki, although it was revealed in Madinah",
       "Madani, although it was revealed before the hijrah"], 1),

    q("Qur'anic Sciences", "easy",
      "What are the muhkam verses of the Qur'an?",
      ["Those that were revealed at Madinah after the hijrah",
       "Those that only the scholars of hadith are able to explain",
       "Those whose meaning is clear and needs no further explanation",
       "Those whose ruling was withdrawn by later revelation"], 2),

    q("Qur'anic Sciences", "medium",
      "What is the correct position towards the mutashabih verses?",
      ["To recite them but never to write them down",
       "To reject them, since their meaning is not accessible",
       "To interpret them freely by one's own reasoning",
       "To believe in them and refer their full meaning to Allah"], 3),

    q("Qur'anic Sciences", "medium",
      "What does naskh mean in the sciences of the Qur'an?",
      ["A later ruling replacing an earlier one by revelation",
       "An error of a copyist corrected in the written mushaf",
       "The recitation of a verse in more than one accepted way",
       "A verse explained by means of a saying of a companion"], 0, "adults"),

    q("Qur'anic Sciences", "hard",
      "Which of these is commonly cited by scholars as an instance of naskh?",
      ["The change in the number of the daily prayers",
       "The stages by which wine was made unlawful",
       "The change in the arrangement of the surahs",
       "The change of the language used in the khutbah"], 1, "adults"),

    q("Qur'anic Sciences", "easy",
      "The Muslims first prayed facing Jerusalem and were then commanded to "
      "face the Ka'bah. Which term describes such a change?",
      ["Tafsir", "Nuzul", "Naskh", "Tajwid"], 2, "kids"),

    q("Methods of Tafsir", "easy",
      "What does tafsir bil-ma'thur mean?",
      ["Explaining by comparison with the earlier revealed books",
       "Explaining by the reasoning and language work of the scholar",
       "Explaining by the practice of the people of one's own land",
       "Explaining by narration: the Qur'an, the Sunnah and the salaf"], 3),

    q("Methods of Tafsir", "medium",
      "When is tafsir bil-ra'y regarded as acceptable?",
      ["When it rests on knowledge of Arabic and the established sources",
       "When the one offering it has memorised the whole Qur'an",
       "When it agrees with what most people in the community hold",
       "When no narrated report exists on any part of the Qur'an"],
      0, "adults"),

    q("Methods of Tafsir", "hard",
      "A verse can be explained both by another verse of the Qur'an and by "
      "the opinion of a later scholar. Which takes precedence?",
      ["The opinion of the later scholar",
       "The explanation drawn from another verse of the Qur'an",
       "Whichever is easier to act upon",
       "Whichever of the two is more widely quoted"], 1, "adults"),

    q("Methods of Tafsir", "hard",
      "How are the israiliyyat, reports taken from the earlier scriptures, to "
      "be handled in tafsir?",
      ["Rejected in every case, without any exception",
       "Accepted in full, since they come from revealed books",
       "Accepted only where they agree with the Qur'an and Sunnah",
       "Given precedence where they supply missing detail"], 2, "adults"),

    q("Methods of Tafsir", "easy",
      "On what did the companions rely most when explaining the Qur'an?",
      ["What each of them personally found most likely",
       "What the poets of the Arabs had composed",
       "What the neighbouring nations held to be true",
       "What they had heard from the Prophet ﷺ himself"], 3, "kids"),

    q("Lessons from Stories", "easy",
      "What is the main purpose of the accounts of the prophets in the "
      "Qur'an?",
      ["To give guidance, lessons and steadiness to the believers",
       "To record the exact history and dating of past nations",
       "To entertain the reader with reports of distant lands",
       "To set out the genealogies of the tribes of Arabia"], 0),

    q("Lessons from Stories", "hard",
      "The Qur'an often leaves out names, dates and places in the accounts of "
      "the prophets. What does this indicate?",
      ["That the details had been lost before revelation came",
       "That the lesson matters more than the historical detail",
       "That these accounts are meant for scholars alone",
       "That the details are found in the earlier scriptures"], 1, "adults"),

    q("Lessons from Stories", "easy",
      "What lesson does the Qur'an draw from the account of Musa and Pharaoh?",
      ["That Egypt was the greatest of the nations of its time",
       "That magic proves stronger than the signs of a prophet",
       "That tyranny comes to an end however strong it appears",
       "That a prophet must be a skilled and fluent speaker"], 2, "kids"),

    q("Lessons from Stories", "medium",
      "In the account of Nuh, his son refused to board the ship. What lesson "
      "does the Qur'an draw from this?",
      ["That the ship was built to carry the people of one town",
       "That children are to obey their parents in every matter",
       "That a prophet may save his relatives by his supplication",
       "That family ties alone do not save one who has no faith"], 3, "kids"),

    q("Lessons from Stories", "medium",
      "Why does the Qur'an relate the account of Musa in several different "
      "surahs?",
      ["Each place brings out the lesson that suits its context",
       "The earlier tellings of it were left incomplete",
       "It lengthens the Qur'an and makes memorising easier",
       "Different tribes were each given their own version"], 0, "kids"),

    q("Lessons from Stories", "hard",
      "The Qur'an declines to state the number of the People of the Cave and "
      "comments on disputing over it. What does this teach?",
      ["That the number is known to the scholars of hadith alone",
       "That argument over detail of no benefit is to be avoided",
       "That the account is not intended to be taken literally",
       "That conjecture about the unseen counts as knowledge"], 1, "adults"),

]


# =========================================================================
# MANNERS — STAGE 1 : EVERYDAY ISLAMIC MANNERS
# =========================================================================

MN_S1 = [

    q("Eating & Drinking", "easy",
      "What does a Muslim say before beginning to eat?",
      ["Bismillah", "Alhamdulillah", "Subhanallah", "Astaghfirullah"], 0),

    q("Eating & Drinking", "easy",
      "Which hand is used for eating and drinking?",
      ["The left hand", "The right hand", "Either hand equally",
       "Both hands together"], 1, "kids"),

    q("Eating & Drinking", "medium",
      "A child forgets to say Bismillah and remembers halfway through the "
      "meal. What is he taught to do?",
      ["Begin the meal again from the start",
       "Stop eating and leave the rest of the food",
       "Say Bismillahi awwalahu wa akhirahu and carry on",
       "Say nothing, as the time for it has passed"], 2, "kids"),

    q("Eating & Drinking", "medium",
      "The Prophet ﷺ taught a boy how to eat from a dish shared with others. "
      "What did he instruct?",
      ["Wait until the others have finished eating",
       "Eat from the middle, where the best of it is",
       "Take a little from every side, to be fair",
       "Eat from the side nearest to you"], 3),

    q("Eating & Drinking", "hard",
      "Which manner of drinking is from the Sunnah?",
      ["Seated, and in more than one breath",
       "Standing, and quickly in a single breath",
       "Only once everyone present has drunk",
       "From the broken edge of the vessel"], 0),

    q("Greetings & Speech", "easy",
      "What is the reply to as-salamu 'alaykum?",
      ["Ahlan wa sahlan", "Wa 'alaykum as-salam", "Barakallahu fik",
       "Jazakallahu khayran"], 1),

    q("Greetings & Speech", "medium",
      "Someone sneezes and says Alhamdulillah. What does the one who hears "
      "him say?",
      ["Yahdikum Allah", "Alhamdulillah", "Yarhamuk Allah", "Bismillah"], 2),

    q("Greetings & Speech", "hard",
      "After being answered with Yarhamuk Allah, what does the one who "
      "sneezed then say?",
      ["Alhamdulillahi rabbil 'alamin", "Wa 'alaykum as-salam",
       "Barakallahu fik", "Yahdikumullah wa yuslihu balakum"], 3),

    q("Greetings & Speech", "medium",
      "When a young person meets an older person, who gives the salam first?",
      ["The younger greets the older", "The older greets the younger",
       "Whichever of them speaks first", "Neither, until they shake hands"],
      0, "kids"),

    q("Greetings & Speech", "medium",
      "A Muslim comes into a room where people are already sitting. What does "
      "the Sunnah of greeting require?",
      ["Salam on entering only", "Salam on entering and again on leaving",
       "Salam only if he is acquainted with them",
       "Waiting for them to greet him first"], 1, "adults"),

    q("Greetings & Speech", "easy",
      "What does a Muslim say when speaking about something he intends to do "
      "later?",
      ["Alhamdulillah", "Ma sha Allah", "In sha Allah", "Bismillah"],
      2, "kids"),

    q("Greetings & Speech", "medium",
      "A person admires something belonging to another. What is he taught to "
      "say so that no harm follows from his admiration?",
      ["Astaghfirullah al-'azim", "Subhanallahi wa bihamdih",
       "La hawla wa la quwwata illa billah", "Ma sha Allah, tabarakallah"],
      3, "adults"),

    q("Home & Guests", "easy",
      "What does a Muslim do when coming into his own home?",
      ["Say Bismillah and greet the household with salam",
       "Enter quietly, so that nobody is disturbed",
       "Enter with the left foot and say nothing",
       "Knock repeatedly until someone opens the door"], 0, "kids"),

    q("Home & Guests", "hard",
      "How many times does one seek permission at another person's door "
      "before withdrawing?",
      ["Once, then enter if the door stands open",
       "Three times, then leave if there is no answer",
       "Five times, then call out the owner's name",
       "Twice, then wait outside until someone comes"], 1),

    q("Home & Guests", "hard",
      "Hospitality to a guest is a right upon the host for a set period, "
      "beyond which it becomes voluntary kindness. How long is that period?",
      ["Seven days", "One day", "Three days", "Ten days"], 2, "adults"),

    q("Home & Guests", "medium",
      "A guest is brought into the house and the gathering has begun. Where "
      "should he seat himself?",
      ["Wherever he finds himself most comfortable",
       "At the head of the gathering",
       "Nearest the door, so as to leave easily",
       "Where the host directs him to sit"], 3, "adults"),

    q("Kindness & Care", "medium",
      "The Prophet ﷺ said that Jibril kept counselling him about the "
      "neighbour so persistently that he thought the neighbour would be given "
      "what?",
      ["A share of inheritance", "An exemption from zakah",
       "A place in the front row", "A permanent place in his household"], 0),

    q("Kindness & Care", "medium",
      "A cat comes into the house and drinks from a dish. What did the "
      "Prophet ﷺ teach about cats?",
      ["They are to be kept outside the house at all times",
       "They are not impure and move about among us",
       "They must be washed before entering any room",
       "They may not be given food from the household"], 1, "kids"),

    q("Kindness & Care", "easy",
      "The Prophet ﷺ told of a man who found a thirsty dog and drew water for "
      "it. What came of it?",
      ["He was granted wealth in this world",
       "He was told to keep the dog with him",
       "Allah forgave him for what he had done",
       "He was made a leader over his people"], 2, "kids"),

    q("Kindness & Care", "medium",
      "In Surah al-Isra', the command to worship none but Allah is joined "
      "immediately with which duty?",
      ["Honouring the neighbour", "Charity to the poor", "Fasting in Ramadan",
       "Kindness to parents"], 3, "adults"),

    q("Kindness & Care", "medium",
      "The Prophet ﷺ said that a buyer and a seller who are truthful and make "
      "matters clear receive what?",
      ["Blessing in their transaction", "A doubling of the agreed price",
       "The cancelling of their debts", "A record of it as charity"], 0),

    q("Kindness & Care", "medium",
      "The Prophet ﷺ described removing something harmful from the road as "
      "what?",
      ["A form of zakah", "A branch of faith", "A condition of prayer",
       "A kind of fasting"], 1, "adults"),

    q("Masjid Manners", "easy",
      "How does a Muslim enter the masjid?",
      ["With either foot, with no du'a required",
       "With the left foot, saying the du'a for leaving",
       "With the right foot, saying the du'a for entering",
       "With the right foot, keeping complete silence"], 2, "kids"),

    q("Masjid Manners", "medium",
      "What is a person taught to do on entering the masjid before he sits "
      "down?",
      ["Face the qiblah and make takbir", "Recite Surah al-Fatihah aloud",
       "Give salam to the imam first", "Pray two rak'ah of tahiyyat al-masjid"],
      3),

    q("Masjid Manners", "hard",
      "A man loses an item and calls out for it inside the masjid. What did "
      "the Prophet ﷺ teach about this?",
      ["That it is not to be done in the masjid",
       "That it is allowed if done quietly",
       "That it is allowed once the prayer has ended",
       "That it is allowed on Friday only"], 0),

    q("Masjid Manners", "hard",
      "A person has eaten raw garlic and the smell remains on him. What is he "
      "instructed to do about the congregation?",
      ["Eat it only after the congregational prayer",
       "Stay away from the masjid until the smell has gone",
       "Sit at the back of the masjid, away from others",
       "Cover his mouth for the length of the prayer"], 1),

]


# =========================================================================
# MANNERS — STAGE 2 : CHARACTER IN PRACTICE
# =========================================================================

MN_S2 = [

    q("Speech & Slander", "medium",
      "How did the Prophet ﷺ define ghibah?",
      ["Mentioning of your brother what he would dislike, though it is true",
       "Saying of your brother something that is not true of him",
       "Carrying a word between two people so as to divide them",
       "Praising a person to his face beyond what he deserves"], 0, "adults"),

    q("Speech & Slander", "easy",
      "Saying about a person something that is simply untrue is called "
      "what?",
      ["Ghibah", "Buhtan", "Nameemah", "Ghadab"], 1, "adults"),

    q("Speech & Slander", "easy",
      "What is nameemah?",
      ["Making an accusation against someone in public",
       "Speaking about a person while he is not present",
       "Carrying words between people so as to cause discord",
       "Drawing attention to one's own good deeds"], 2, "adults"),

    q("Speech & Slander", "hard",
      "After a meeting has ended, a colleague repeats to others a true but "
      "embarrassing personal fact about an absent employee, with no need "
      "behind it. How is this classified?",
      ["Buhtan, since he was not present to answer it",
       "Permissible, since what was said about him is true",
       "Permissible, since it was said in a work setting",
       "Ghibah, since being true does not remove the prohibition"],
      3, "adults"),

    q("Speech & Slander", "hard",
      "Mentioning another person's fault is permitted where there is a "
      "recognised need. Which of these is such a case?",
      ["Warning someone about a prospective partner's dishonesty",
       "Telling friends of a relative's failing so they sympathise",
       "Discussing a neighbour's debts to pass the evening",
       "Repeating a rumour in order to find out if it is true"], 0, "adults"),

    q("Speech & Slander", "medium",
      "Yusuf hears that a classmate said something bad about him, and another "
      "boy offers to tell him exactly who said what. What does Islam teach "
      "about this?",
      ["To listen, so that he can defend himself",
       "Not to carry such words between people",
       "To repeat it back to the classmate's friends",
       "To ask the teacher to punish the classmate"], 1, "kids"),

    q("Speech & Slander", "easy",
      "Some children in class are laughing at a boy's accent. What does the "
      "Qur'an say about ridiculing people?",
      ["It allows it when it is intended as a joke",
       "It allows it when the person is not present",
       "It forbids one group from mocking another",
       "It allows it when others began it first"], 2, "kids"),

    q("Parents & Family", "medium",
      "The Qur'an forbids saying even a word of annoyance to a parent. "
      "Applied to an adult whose elderly father asks the same question "
      "repeatedly, what does this require?",
      ["Giving a brief reply and moving the subject on",
       "Pointing out that he has already been told",
       "Asking a sibling to take over the conversation",
       "Answering him again without showing irritation"], 3, "adults"),

    q("Parents & Family", "hard",
      "A parent instructs an adult child to do something clearly unlawful in "
      "Islam. What is required of the child?",
      ["To decline the instruction while continuing to treat them well",
       "To comply, since obedience to parents comes before this",
       "To break off contact until the instruction is withdrawn",
       "To comply and then to seek forgiveness afterwards"], 0, "adults"),

    q("Parents & Family", "medium",
      "A man's mother has not accepted Islam and asks him to visit her often. "
      "What does the Sharia say about his conduct towards her?",
      ["Contact with her is limited to matters of necessity",
       "Kindness and good company towards her are still due",
       "Kindness is due to her only when she is in need",
       "The duty of good conduct ended when he accepted Islam"], 1, "adults"),

    q("Parents & Family", "easy",
      "Amina is playing with her friends when her mother calls her to help in "
      "the kitchen. What does birr al-walidayn require of her?",
      ["To ask her brother to go instead of her",
       "To finish the game first and then go",
       "To go to her mother when called",
       "To explain that she will help her later"], 2, "kids"),

    q("Parents & Family", "hard",
      "How may a person show birr to his parents after they have died?",
      ["By naming a child after them as a memorial",
       "By visiting the grave every week without fail",
       "By giving away the whole of their wealth in charity",
       "By supplicating for them and keeping ties with their friends"],
      3, "adults"),

    q("Patience & Forgiveness", "easy",
      "Which best describes sabr?",
      ["Holding oneself back from complaint against Allah's decree",
       "Feeling no sorrow at all when a difficulty comes",
       "Bearing harm without ever seeking one's right",
       "Staying silent whenever one has been wronged"], 0, "adults"),

    q("Patience & Forgiveness", "medium",
      "A believer weeps at the death of a relative. How does this stand in "
      "relation to sabr?",
      ["It contradicts sabr, since sabr means showing no emotion",
       "It does not contradict sabr, so long as there is no complaint",
       "It contradicts sabr only if other people can see the tears",
       "It has no bearing on sabr, which concerns illness alone"], 1),

    q("Patience & Forgiveness", "hard",
      "A man is cheated out of his money by a business partner. Which "
      "statement is correct?",
      ["He must pursue it, and pardoning it is not permitted",
       "He must pardon and may not pursue the money at all",
       "He may claim his right by lawful means, and pardon is better",
       "He may claim double the amount as a penalty for it"], 2, "adults"),

    q("Patience & Forgiveness", "easy",
      "The Prophet ﷺ said that the strong person is not the one who overcomes "
      "others in wrestling, but the one who does what?",
      ["Carries the heaviest load without help",
       "Endures hunger longer than the rest",
       "Speaks loudest when a dispute breaks out",
       "Controls himself at the moment of anger"], 3),

    q("Patience & Forgiveness", "medium",
      "A boy is pushed by a classmate, who then apologises to him honestly. "
      "Which response does Islam call the better one?",
      ["To accept the apology and let the matter rest",
       "To accept it but stop speaking to him afterwards",
       "To report it anyway so that it is on record",
       "To wait until he has apologised a second time"], 0, "kids"),

    q("Trust & Truthfulness", "medium",
      "An employee is given a company laptop for his work and uses it, "
      "without permission, to run a private business. Which quality has he "
      "failed in?",
      ["Sabr", "Amanah", "Hilm", "Haya'"], 1, "adults"),

    q("Trust & Truthfulness", "hard",
      "Two people speak privately and one of them discloses something "
      "personal. How is that conversation regarded?",
      ["It may be passed on once enough time has gone by",
       "It may be passed on to close family members only",
       "The gathering itself is a trust and is not disclosed",
       "It may be passed on if he did not call it a secret"], 2, "adults"),

    q("Trust & Truthfulness", "medium",
      "What does sidq mean as a quality of a person's character?",
      ["That he repeats exactly what he has heard from others",
       "That he speaks only when he is certain of the facts",
       "That he keeps away from what does not concern him",
       "That his words, his intention and his actions agree"], 3),

    q("Trust & Truthfulness", "medium",
      "A boy borrows a classmate's book and loses it. What does amanah "
      "require of him?",
      ["To tell him what happened and replace the book",
       "To say nothing unless the classmate asks about it",
       "To explain that the book was only a borrowed one",
       "To offer to lend the classmate one of his own"], 0, "kids"),

    q("Trust & Truthfulness", "medium",
      "A man promises to attend a meeting, then a more profitable engagement "
      "comes up. What do the reported signs of hypocrisy indicate here?",
      ["A promise may be set aside when the benefit is greater",
       "Breaking a promise without an excuse is one of those signs",
       "A promise is binding only when it has been written down",
       "A promise is binding only between one Muslim and another"],
      1, "adults"),

    q("Humility & Conduct", "medium",
      "How did the Prophet ﷺ define kibr, arrogance?",
      ["Speaking to others about one's own achievements",
       "Enjoying a high position among people",
       "Rejecting the truth and looking down upon people",
       "Wishing to be served before others in a queue"], 2, "adults"),

    q("Humility & Conduct", "medium",
      "A man likes his clothes and his shoes to look good. According to the "
      "hadith on arrogance, how is this judged?",
      ["It is not arrogance so long as nobody else notices",
       "It is arrogance, because it draws attention to himself",
       "It is arrogance unless the clothing is inexpensive",
       "It is not arrogance, for Allah is beautiful and loves beauty"], 3),

    q("Humility & Conduct", "hard",
      "A manager is praised publicly for work his team carried out. Which "
      "response is both truthful and free of arrogance?",
      ["To ascribe it to Allah and name the team's part in it",
       "To take the praise in silence and avoid embarrassment",
       "To deny having had any part in the work at all",
       "To pass the praise on to one senior colleague"], 0, "adults"),

    q("Humility & Conduct", "easy",
      "A boy wins a race and his friends praise him for it. Which response "
      "fits Islamic manners?",
      ["To remind them how much he had trained",
       "To thank Allah and to thank his friends",
       "To tell them he could have run much faster",
       "To say that the others were not really trying"], 1, "kids"),

]
