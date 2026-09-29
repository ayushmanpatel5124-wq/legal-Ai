export type CorpusEntry = {
  slug: string;
  title: string;
  citation: string;
  sourceType: "statute" | "judgment" | "notification";
  domain: string;
  summary: string;
  body: string;
  keywords: string[];
  authorityScore: number;
};

export const CORPUS: CorpusEntry[] = [
  {
    slug: "cpa-2019-defective-goods",
    title: "Consumer remedies for defective goods and deficient services",
    citation: "Consumer Protection Act, 2019, ss. 2(11), 2(10), 35",
    sourceType: "statute",
    domain: "Consumer",
    summary:
      "A consumer may file a complaint before the appropriate consumer commission for a defect in goods or a deficiency in service.",
    body:
      "Under the Consumer Protection Act, 2019, 'defect' means any fault, imperfection or shortcoming in the quality, quantity, potency, purity or standard of goods, and 'deficiency' means any fault, shortcoming or inadequacy in the quality, nature and manner of performance of a service. Section 35 permits a consumer, a recognised consumer association, the Central Government or the Central Authority to file a complaint with the District Commission. Relief may include replacement, refund of the price, compensation for loss or injury, and removal of the defect. The complaint must ordinarily be filed within two years of the cause of action (s. 69), subject to condonation of delay for sufficient cause.",
    keywords: [
      "consumer",
      "defect",
      "defective",
      "product",
      "goods",
      "refund",
      "replacement",
      "deficiency",
      "service",
      "complaint",
      "commission",
    ],
    authorityScore: 0.95,
  },
  {
    slug: "cpa-2019-pecuniary-jurisdiction",
    title: "Which consumer commission hears a complaint",
    citation: "Consumer Protection Act, 2019, ss. 34, 47, 58",
    sourceType: "statute",
    domain: "Consumer",
    summary:
      "Pecuniary jurisdiction determines whether the District, State or National Commission hears the complaint.",
    body:
      "The District Commission hears complaints where the value of the goods or services paid as consideration does not exceed the statutory ceiling; the State Commission and the National Commission hear higher-value complaints. Jurisdictional ceilings have been revised by notification, so the current limit should always be checked before filing. Territorial jurisdiction may be based on where the opposite party resides or carries on business, or where the complainant resides or personally works for gain.",
    keywords: [
      "consumer",
      "jurisdiction",
      "district",
      "state",
      "national",
      "commission",
      "filing",
      "forum",
    ],
    authorityScore: 0.85,
  },
  {
    slug: "tenancy-eviction-notice",
    title: "Eviction of a tenant and the requirement of notice",
    citation: "Transfer of Property Act, 1882, s. 106; applicable State rent legislation",
    sourceType: "statute",
    domain: "Property",
    summary:
      "A tenant generally cannot be evicted without following the notice and legal procedure applicable to the tenancy.",
    body:
      "Section 106 of the Transfer of Property Act, 1882 provides that in the absence of a contract or local law to the contrary, a lease of immovable property for agricultural or manufacturing purposes is deemed to be year-to-year terminable by six months' notice, and a lease for any other purpose is deemed to be month-to-month terminable by fifteen days' notice. State rent-control statutes additionally restrict eviction to specified grounds such as default in payment of rent, subletting without consent, bona fide requirement of the landlord, or material damage to the premises. Forcible dispossession without recourse to the court is not permitted; a landlord must ordinarily obtain an order from the competent court or rent authority.",
    keywords: [
      "tenant",
      "tenancy",
      "landlord",
      "evict",
      "eviction",
      "notice",
      "rent",
      "lease",
      "possession",
    ],
    authorityScore: 0.92,
  },
  {
    slug: "ipc-420-cheating",
    title: "Cheating and dishonestly inducing delivery of property",
    citation: "Indian Penal Code, 1860, s. 420; Bharatiya Nyaya Sanhita, 2023, s. 318(4)",
    sourceType: "statute",
    domain: "Criminal",
    summary:
      "Section 420 IPC dealt with cheating and dishonestly inducing delivery of property; the corresponding present provision is s. 318 BNS, 2023.",
    body:
      "Section 420 of the Indian Penal Code, 1860 punished whoever cheats and thereby dishonestly induces the person deceived to deliver any property, or to make, alter or destroy the whole or any part of a valuable security, with imprisonment which may extend to seven years and fine. Cheating is defined in s. 415 IPC and requires deception plus a fraudulent or dishonest inducement. With effect from 1 July 2024 the Bharatiya Nyaya Sanhita, 2023 replaced the IPC; cheating and dishonestly inducing delivery of property is now dealt with in s. 318 BNS. Offences committed before the commencement date continue to be tried under the IPC.",
    keywords: [
      "420",
      "cheating",
      "ipc",
      "fraud",
      "bns",
      "penal",
      "deception",
      "criminal",
      "section",
    ],
    authorityScore: 0.97,
  },
  {
    slug: "contract-formation",
    title: "Formation and enforceability of a contract",
    citation: "Indian Contract Act, 1872, ss. 10, 2(h), 23, 25",
    sourceType: "statute",
    domain: "Civil",
    summary:
      "An agreement is enforceable where there is free consent of competent parties, lawful consideration and a lawful object.",
    body:
      "Section 10 of the Indian Contract Act, 1872 states that all agreements are contracts if they are made by the free consent of parties competent to contract, for a lawful consideration and with a lawful object, and are not expressly declared void. Consent is not free when caused by coercion, undue influence, fraud, misrepresentation or mistake (s. 14). An agreement without consideration is void subject to the exceptions in s. 25. Agreements whose object or consideration is unlawful, immoral or opposed to public policy are void under s. 23.",
    keywords: [
      "contract",
      "agreement",
      "consideration",
      "offer",
      "acceptance",
      "consent",
      "void",
      "enforceable",
    ],
    authorityScore: 0.94,
  },
  {
    slug: "contract-breach-remedies",
    title: "Remedies for breach of contract",
    citation: "Indian Contract Act, 1872, ss. 73, 74; Specific Relief Act, 1963",
    sourceType: "statute",
    domain: "Civil",
    summary:
      "The injured party may claim compensation for loss naturally arising from breach, and in some cases specific performance or injunction.",
    body:
      "Section 73 of the Indian Contract Act, 1872 entitles the party suffering a breach to compensation for loss or damage which naturally arose in the usual course of things from the breach, or which the parties knew when they made the contract to be likely to result. Remote and indirect loss is not compensable. Where the contract stipulates a sum payable on breach, s. 74 permits reasonable compensation not exceeding that sum, whether or not actual damage is proved. The Specific Relief Act, 1963, as amended in 2018, makes specific performance a general remedy subject to the statutory exceptions, and also provides for injunctions and substituted performance.",
    keywords: [
      "breach",
      "damages",
      "compensation",
      "penalty",
      "liquidated",
      "specific performance",
      "injunction",
      "remedy",
      "contract",
    ],
    authorityScore: 0.92,
  },
  {
    slug: "employment-termination-notice",
    title: "Termination of employment and notice requirements",
    citation:
      "Industrial Disputes Act, 1947, ss. 25F, 2(oo); Shops and Establishments legislation; contract of employment",
    sourceType: "statute",
    domain: "Labour",
    summary:
      "Notice and compensation obligations depend on whether the employee is a workman, on the contract and on applicable State legislation.",
    body:
      "Section 25F of the Industrial Disputes Act, 1947 provides that a workman in continuous service for not less than one year cannot be retrenched unless given one month's written notice indicating the reasons (or wages in lieu), and paid retrenchment compensation equivalent to fifteen days' average pay for every completed year of continuous service, with notice to the appropriate Government. 'Retrenchment' under s. 2(oo) excludes voluntary retirement, superannuation, non-renewal of a contract and termination for proven misconduct after due enquiry. Employees who are not workmen are ordinarily governed by the contract of employment and the relevant State Shops and Establishments Act, which commonly prescribe notice periods. Termination for misconduct requires compliance with principles of natural justice and, where applicable, certified standing orders.",
    keywords: [
      "employment",
      "employee",
      "employer",
      "termination",
      "terminate",
      "notice",
      "retrenchment",
      "dismissal",
      "salary",
      "workman",
      "labour",
    ],
    authorityScore: 0.9,
  },
  {
    slug: "wages-payment",
    title: "Payment of wages and delayed salary",
    citation: "Code on Wages, 2019; Payment of Wages Act, 1936",
    sourceType: "statute",
    domain: "Labour",
    summary:
      "Wages must be paid within the prescribed wage period and unauthorised deductions are restricted.",
    body:
      "The Code on Wages, 2019 consolidates earlier wage legislation and requires the employer to fix a wage period and pay wages within the prescribed time, including on termination, where wages are ordinarily payable within two working days of removal, dismissal, retrenchment or resignation. Deductions are permitted only in the categories specified by the statute. A claim for unpaid or delayed wages can be raised before the authority notified under the Code, and limitation periods apply.",
    keywords: [
      "wages",
      "salary",
      "unpaid",
      "delay",
      "deduction",
      "employer",
      "payment",
      "labour",
    ],
    authorityScore: 0.86,
  },
  {
    slug: "constitution-article-21",
    title: "Protection of life and personal liberty",
    citation: "Constitution of India, art. 21; Maneka Gandhi v. Union of India (1978) 1 SCC 248",
    sourceType: "judgment",
    domain: "Constitutional",
    summary:
      "No person may be deprived of life or personal liberty except according to a procedure established by law, which must be fair, just and reasonable.",
    body:
      "Article 21 of the Constitution of India provides that no person shall be deprived of his life or personal liberty except according to procedure established by law. In Maneka Gandhi v. Union of India the Supreme Court held that the procedure must be right, just and fair, and not arbitrary, fanciful or oppressive, effectively reading due process into Article 21. The Article has been interpreted to include the right to live with human dignity, the right to livelihood, the right to a clean environment, the right to privacy (K.S. Puttaswamy v. Union of India (2017) 10 SCC 1) and the right to a speedy trial.",
    keywords: [
      "article 21",
      "life",
      "liberty",
      "fundamental right",
      "constitution",
      "privacy",
      "dignity",
      "due process",
    ],
    authorityScore: 0.98,
  },
  {
    slug: "constitution-article-14",
    title: "Equality before the law and reasonable classification",
    citation: "Constitution of India, art. 14; E.P. Royappa v. State of Tamil Nadu (1974) 4 SCC 3",
    sourceType: "judgment",
    domain: "Constitutional",
    summary:
      "Article 14 guarantees equality before the law and permits classification only where it is intelligible and rationally connected to the object sought.",
    body:
      "Article 14 provides that the State shall not deny to any person equality before the law or the equal protection of the laws within the territory of India. Classification is permissible if it is founded on an intelligible differentia and that differentia has a rational nexus with the object sought to be achieved by the statute. The Supreme Court has additionally held that Article 14 strikes at arbitrariness in State action, since arbitrariness is antithetical to equality.",
    keywords: [
      "article 14",
      "equality",
      "discrimination",
      "arbitrary",
      "classification",
      "constitution",
      "fundamental right",
    ],
    authorityScore: 0.95,
  },
  {
    slug: "writ-remedies",
    title: "Writ jurisdiction of the High Courts and Supreme Court",
    citation: "Constitution of India, arts. 32 and 226",
    sourceType: "statute",
    domain: "Constitutional",
    summary:
      "Article 32 allows a petition to the Supreme Court for enforcement of fundamental rights; Article 226 gives the High Courts wider writ jurisdiction.",
    body:
      "Article 32 confers the right to move the Supreme Court by appropriate proceedings for the enforcement of the rights conferred by Part III, and is itself a fundamental right. Article 226 empowers every High Court to issue directions, orders or writs including habeas corpus, mandamus, prohibition, quo warranto and certiorari, for the enforcement of fundamental rights and for any other purpose. Writ jurisdiction is discretionary and is ordinarily declined where an efficacious alternative remedy exists, save in cases of breach of natural justice, lack of jurisdiction or violation of fundamental rights.",
    keywords: [
      "writ",
      "article 32",
      "article 226",
      "habeas corpus",
      "mandamus",
      "high court",
      "supreme court",
      "petition",
    ],
    authorityScore: 0.93,
  },
  {
    slug: "fir-registration",
    title: "Registration of an FIR in a cognizable offence",
    citation:
      "Bharatiya Nagarik Suraksha Sanhita, 2023, s. 173; Lalita Kumari v. Govt. of U.P. (2014) 2 SCC 1",
    sourceType: "judgment",
    domain: "Criminal",
    summary:
      "Registration of a First Information Report is mandatory when the information discloses a cognizable offence.",
    body:
      "In Lalita Kumari v. Government of Uttar Pradesh the Constitution Bench held that registration of an FIR is mandatory under s. 154 CrPC (now s. 173 BNSS, 2023) if the information discloses commission of a cognizable offence, and no preliminary inquiry is permissible in such a situation. A preliminary inquiry, limited in scope and ordinarily to be completed within the period prescribed, may be conducted only where it is not clear whether a cognizable offence is disclosed, for example in matrimonial, commercial, medical negligence and corruption matters. If the officer in charge refuses to register the FIR, the informant may approach the Superintendent of Police and thereafter the Magistrate.",
    keywords: [
      "fir",
      "police",
      "cognizable",
      "complaint",
      "registration",
      "criminal",
      "investigation",
      "bnss",
    ],
    authorityScore: 0.96,
  },
  {
    slug: "arrest-and-bail",
    title: "Arrest, bail and rights of an arrested person",
    citation:
      "Bharatiya Nagarik Suraksha Sanhita, 2023; Arnesh Kumar v. State of Bihar (2014) 8 SCC 273",
    sourceType: "judgment",
    domain: "Criminal",
    summary:
      "Arrest is not automatic for offences punishable up to seven years, and an arrested person has rights to information, legal aid and production before a magistrate within 24 hours.",
    body:
      "An arrested person must be informed of the grounds of arrest, has a right to consult a legal practitioner of choice, has a right to have a relative or friend informed of the arrest, and must be produced before the nearest Magistrate within twenty-four hours excluding travel time. In Arnesh Kumar v. State of Bihar the Supreme Court directed that police officers should not automatically arrest for offences punishable with imprisonment up to seven years, and must record reasons satisfying the necessity conditions; a notice of appearance should ordinarily be issued instead. Bail in bailable offences is a matter of right; in non-bailable offences it is discretionary and guided by the gravity of the offence, flight risk, and likelihood of tampering with evidence.",
    keywords: [
      "arrest",
      "bail",
      "police",
      "custody",
      "magistrate",
      "anticipatory",
      "criminal",
      "rights",
    ],
    authorityScore: 0.94,
  },
  {
    slug: "property-sale-registration",
    title: "Sale of immovable property and compulsory registration",
    citation: "Transfer of Property Act, 1882, s. 54; Registration Act, 1908, s. 17",
    sourceType: "statute",
    domain: "Property",
    summary:
      "A sale of immovable property of value one hundred rupees and upwards must be made by a registered instrument.",
    body:
      "Section 54 of the Transfer of Property Act, 1882 defines sale as a transfer of ownership in exchange for a price paid or promised, and requires that in the case of tangible immovable property of the value of one hundred rupees and upwards the transfer be made only by a registered instrument. Section 17 of the Registration Act, 1908 makes such instruments compulsorily registrable, and an unregistered document does not affect the immovable property or operate as evidence of the transaction except for the limited purposes allowed by s. 49 of that Act. An agreement to sell does not by itself create any interest in or charge on the property.",
    keywords: [
      "property",
      "sale deed",
      "registration",
      "title",
      "immovable",
      "transfer",
      "land",
      "agreement to sell",
    ],
    authorityScore: 0.93,
  },
  {
    slug: "family-maintenance",
    title: "Maintenance of wife, children and parents",
    citation:
      "Bharatiya Nagarik Suraksha Sanhita, 2023, s. 144; Hindu Adoptions and Maintenance Act, 1956",
    sourceType: "statute",
    domain: "Family",
    summary:
      "A person with sufficient means who neglects a dependent spouse, child or parent may be ordered to pay monthly maintenance.",
    body:
      "The summary maintenance remedy (formerly s. 125 CrPC, now s. 144 BNSS, 2023) allows a Magistrate to order a person of sufficient means to pay a monthly allowance for the maintenance of a wife unable to maintain herself, a legitimate or illegitimate minor child, an adult child unable to maintain itself by reason of physical or mental abnormality, and parents unable to maintain themselves. A wife living in adultery, refusing to live with the husband without sufficient reason, or living separately by mutual consent is generally not entitled. Parallel civil remedies exist under personal-law statutes and under the Protection of Women from Domestic Violence Act, 2005.",
    keywords: [
      "maintenance",
      "wife",
      "husband",
      "child",
      "parents",
      "alimony",
      "family",
      "domestic",
    ],
    authorityScore: 0.9,
  },
  {
    slug: "divorce-grounds",
    title: "Grounds for divorce and judicial separation",
    citation: "Hindu Marriage Act, 1955, ss. 13, 13B; Special Marriage Act, 1954",
    sourceType: "statute",
    domain: "Family",
    summary:
      "Divorce may be sought on fault grounds such as cruelty, desertion and adultery, or by mutual consent after the statutory period.",
    body:
      "Section 13 of the Hindu Marriage Act, 1955 permits a petition for divorce on grounds including adultery, cruelty, desertion for a continuous period of not less than two years, conversion, unsoundness of mind, virulent and incurable leprosy historically, venereal disease in a communicable form, and renunciation of the world. Section 13B provides for divorce by mutual consent where the parties have been living separately for one year or more; a motion is made after six months and before eighteen months of the petition, though the Supreme Court has held the six-month period may be waived in appropriate cases. Corresponding provisions exist in other personal-law statutes and in the Special Marriage Act, 1954.",
    keywords: [
      "divorce",
      "marriage",
      "cruelty",
      "desertion",
      "mutual consent",
      "separation",
      "family",
      "spouse",
    ],
    authorityScore: 0.9,
  },
  {
    slug: "limitation-periods",
    title: "Limitation periods for civil suits",
    citation: "Limitation Act, 1963, ss. 3, 5, arts. 54, 113",
    sourceType: "statute",
    domain: "Civil",
    summary:
      "A suit filed after the prescribed limitation period is liable to be dismissed even if limitation is not pleaded as a defence.",
    body:
      "Section 3 of the Limitation Act, 1963 requires every suit, appeal or application instituted after the prescribed period to be dismissed, although limitation has not been set up as a defence. The residuary Article 113 prescribes three years from when the right to sue accrues. A suit for specific performance under Article 54 must be brought within three years from the date fixed for performance, or where no such date is fixed, from when the plaintiff has notice that performance is refused. Section 5 permits condonation of delay in appeals and applications for sufficient cause, but not ordinarily for suits.",
    keywords: [
      "limitation",
      "time bar",
      "delay",
      "suit",
      "period",
      "three years",
      "civil",
    ],
    authorityScore: 0.88,
  },
  {
    slug: "arbitration-clause",
    title: "Arbitration agreements and reference to arbitration",
    citation: "Arbitration and Conciliation Act, 1996, ss. 7, 8, 11, 34",
    sourceType: "statute",
    domain: "Corporate",
    summary:
      "A written arbitration agreement obliges the court to refer the parties to arbitration, and awards may be set aside only on narrow grounds.",
    body:
      "Section 7 of the Arbitration and Conciliation Act, 1996 requires an arbitration agreement to be in writing. Under s. 8, a judicial authority before which an action is brought in a matter that is the subject of an arbitration agreement must refer the parties to arbitration unless it finds prima facie that no valid arbitration agreement exists. Section 11 provides for appointment of arbitrators by the court or designated institution where the agreed procedure fails. An award may be set aside under s. 34 only on limited grounds such as incapacity, invalidity of the agreement, lack of proper notice, excess of jurisdiction, or conflict with the public policy of India, which includes fraud, contravention of fundamental policy of Indian law, and patent illegality in domestic awards.",
    keywords: [
      "arbitration",
      "award",
      "dispute resolution",
      "seat",
      "venue",
      "clause",
      "section 34",
      "corporate",
    ],
    authorityScore: 0.9,
  },
  {
    slug: "company-director-duties",
    title: "Duties of a company director",
    citation: "Companies Act, 2013, ss. 166, 149(6)",
    sourceType: "statute",
    domain: "Corporate",
    summary:
      "Directors owe statutory duties of good faith, due care, independent judgment and avoidance of conflicts of interest.",
    body:
      "Section 166 of the Companies Act, 2013 requires a director to act in accordance with the articles, to act in good faith to promote the objects of the company for the benefit of its members as a whole and in the best interests of the company, its employees, shareholders, the community and the environment, to exercise duties with due and reasonable care, skill and diligence and independent judgment, to avoid situations of direct or indirect conflict with the interest of the company, not to achieve undue gain or advantage, and not to assign office. Contravention attracts penalty, and undue gain is recoverable by the company.",
    keywords: [
      "director",
      "company",
      "fiduciary",
      "duties",
      "corporate",
      "conflict",
      "companies act",
      "governance",
    ],
    authorityScore: 0.88,
  },
  {
    slug: "gst-registration",
    title: "Liability to register under GST",
    citation: "Central Goods and Services Tax Act, 2017, ss. 22, 24",
    sourceType: "statute",
    domain: "Tax",
    summary:
      "Registration is required once aggregate turnover exceeds the notified threshold, and compulsorily in certain categories regardless of turnover.",
    body:
      "Section 22 of the CGST Act, 2017 requires every supplier making a taxable supply to be registered in the State from which the supply is made if aggregate turnover in a financial year exceeds the notified threshold, which differs for goods and services and for special category States. Section 24 requires compulsory registration irrespective of turnover for categories including persons making inter-State taxable supply of goods, casual taxable persons, persons liable to pay tax under reverse charge, e-commerce operators and non-resident taxable persons. Thresholds are subject to notification and should be checked for the relevant financial year.",
    keywords: [
      "gst",
      "tax",
      "registration",
      "turnover",
      "threshold",
      "supply",
      "cgst",
    ],
    authorityScore: 0.85,
  },
  {
    slug: "income-tax-return-filing",
    title: "Obligation to file an income tax return",
    citation: "Income-tax Act, 1961, ss. 139, 234F",
    sourceType: "statute",
    domain: "Tax",
    summary:
      "A return must be filed where total income exceeds the basic exemption limit or where prescribed conditions are met; late filing attracts a fee.",
    body:
      "Section 139(1) of the Income-tax Act, 1961 requires every person whose total income before giving effect to specified deductions exceeds the maximum amount not chargeable to tax to furnish a return by the due date. The seventh proviso extends the obligation to persons satisfying prescribed conditions, such as high-value deposits, foreign travel expenditure or electricity consumption above notified limits. A belated return may be filed under s. 139(4) and a revised return under s. 139(5), within the time allowed. Section 234F levies a fee for filing after the due date.",
    keywords: [
      "income tax",
      "return",
      "filing",
      "itr",
      "due date",
      "belated",
      "tax",
    ],
    authorityScore: 0.85,
  },
  {
    slug: "cheque-bounce",
    title: "Dishonour of a cheque for insufficiency of funds",
    citation: "Negotiable Instruments Act, 1881, ss. 138, 142",
    sourceType: "statute",
    domain: "Criminal",
    summary:
      "Dishonour of a cheque is an offence if a demand notice is issued within 30 days and payment is not made within 15 days of receipt.",
    body:
      "Section 138 of the Negotiable Instruments Act, 1881 makes dishonour of a cheque for insufficiency of funds or because it exceeds the arrangement an offence punishable with imprisonment up to two years or fine up to twice the amount of the cheque, or both, provided the cheque was presented within its validity period, the payee issued a written demand notice within thirty days of receiving information of dishonour, and the drawer failed to pay within fifteen days of receipt of the notice. A complaint must be filed within one month of the expiry of that fifteen-day period, subject to condonation for sufficient cause under the proviso to s. 142.",
    keywords: [
      "cheque",
      "bounce",
      "dishonour",
      "138",
      "negotiable",
      "notice",
      "payment",
      "criminal",
    ],
    authorityScore: 0.92,
  },
  {
    slug: "rti-request",
    title: "Right to information and time limits for a reply",
    citation: "Right to Information Act, 2005, ss. 6, 7, 19",
    sourceType: "statute",
    domain: "Constitutional",
    summary:
      "A public authority must ordinarily respond to an RTI request within thirty days, or within forty-eight hours where life or liberty is concerned.",
    body:
      "Section 6 of the Right to Information Act, 2005 allows any citizen to request information from a public authority without stating reasons. Section 7 requires the Public Information Officer to provide the information or reject the request within thirty days of receipt, and within forty-eight hours where the request concerns the life or liberty of a person. Failure to reply within the period is deemed a refusal. A first appeal lies to the designated appellate authority within thirty days, and a second appeal lies to the Information Commission within ninety days under s. 19. Exemptions are listed in s. 8.",
    keywords: [
      "rti",
      "right to information",
      "public authority",
      "appeal",
      "information",
      "thirty days",
    ],
    authorityScore: 0.86,
  },
  {
    slug: "data-protection-dpdp",
    title: "Processing of digital personal data and consent",
    citation: "Digital Personal Data Protection Act, 2023, ss. 4, 6, 8",
    sourceType: "statute",
    domain: "Corporate",
    summary:
      "Digital personal data may be processed only for a lawful purpose with consent or for certain legitimate uses, with defined obligations on the data fiduciary.",
    body:
      "The Digital Personal Data Protection Act, 2023 permits processing of digital personal data only for a lawful purpose for which the data principal has given consent, or for certain legitimate uses specified in s. 7. Consent must be free, specific, informed, unconditional and unambiguous with a clear affirmative action, and must be preceded by an itemised notice. Data fiduciaries must maintain accuracy and completeness, implement reasonable security safeguards, notify personal data breaches to the Board and affected data principals, and erase data when consent is withdrawn or the purpose is no longer served. Significant data fiduciaries have additional obligations including appointment of a data protection officer and data protection impact assessments.",
    keywords: [
      "data protection",
      "privacy",
      "consent",
      "dpdp",
      "personal data",
      "breach",
      "fiduciary",
    ],
    authorityScore: 0.87,
  },
  {
    slug: "domestic-violence-reliefs",
    title: "Reliefs under the Protection of Women from Domestic Violence Act",
    citation: "Protection of Women from Domestic Violence Act, 2005, ss. 12, 17-22",
    sourceType: "statute",
    domain: "Family",
    summary:
      "An aggrieved woman may seek protection, residence, monetary, custody and compensation orders from the Magistrate.",
    body:
      "The Protection of Women from Domestic Violence Act, 2005 allows an aggrieved woman in a domestic relationship to apply to the Magistrate under s. 12 for one or more reliefs: a protection order restraining further acts of domestic violence (s. 18), a residence order securing the right to reside in the shared household (ss. 17 and 19), monetary relief for losses and maintenance (s. 20), custody orders (s. 21) and compensation for mental torture and emotional distress (s. 22). Interim and ex parte orders may be passed, and breach of a protection order is a cognizable offence under s. 31.",
    keywords: [
      "domestic violence",
      "protection order",
      "residence",
      "woman",
      "aggrieved",
      "family",
      "shared household",
    ],
    authorityScore: 0.9,
  },
];
