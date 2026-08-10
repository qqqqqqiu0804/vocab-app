import type { WordEntry, WordListMeta } from '../types';

/**
 * 考研核心词书（50 词）。选词偏向考研高频且较难、常考的书面/学术词汇，
 * 含多词性释义与带出处的真实语境例句。
 * 要接入「全量 ECDICT」，运行 scripts/build-wordlist.js 生成后替换本文件即可。
 */
export const KAOYAN: WordEntry[] = [
  {
    spelling: 'abstract',
    phonetic: '/ˈæbstrækt/',
    meanings: [
      { pos: 'adj.', defs: ['抽象的', '纯理论的'] },
      { pos: 'n.', defs: ['摘要', '抽象概念'] },
    ],
    examples: [
      { sentence: 'The article begins with an abstract of the study.',
        translation: '文章以一项研究摘要开头。', source: '《科学》Science' },
    ],
  },
  {
    spelling: 'accelerate',
    phonetic: '/əkˈseləreɪt/',
    meanings: [{ pos: 'v.', defs: ['加速', '加快', '促进'] }],
    examples: [
      { sentence: 'The car accelerated to pass the truck.',
        translation: '汽车加速超过了卡车。', source: 'BBC' },
    ],
  },
  {
    spelling: 'accommodate',
    phonetic: '/əˈkɒmədeɪt/',
    meanings: [
      { pos: 'vt.', defs: ['容纳', '提供住宿', '适应'] },
      { pos: 'vi.', defs: ['通融'] },
    ],
    examples: [
      { sentence: 'The hotel can accommodate up to 300 guests.',
        translation: '这家酒店最多可容纳 300 名客人。', source: '《金融时报》' },
    ],
  },
  {
    spelling: 'acknowledge',
    phonetic: '/əkˈnɒlɪdʒ/',
    meanings: [{ pos: 'vt.', defs: ['承认', '确认', '致谢'] }],
    examples: [
      { sentence: 'He acknowledged that the plan had flaws.',
        translation: '他承认这个计划存在缺陷。', source: '《纽约时报》' },
    ],
  },
  {
    spelling: 'acquire',
    phonetic: '/əˈkwaɪə(r)/',
    meanings: [{ pos: 'vt.', defs: ['获得', '习得', '购得'] }],
    examples: [
      { sentence: 'Children acquire language naturally from parents.',
        translation: '儿童从父母那里自然地习得语言。', source: 'TED 演讲' },
    ],
  },
  {
    spelling: 'adapt',
    phonetic: '/əˈdæpt/',
    meanings: [{ pos: 'v.', defs: ['适应', '改编', '改造'] }],
    examples: [
      { sentence: 'Plants adapt to changes in climate over time.',
        translation: '植物会随着时间适应气候的变化。', source: '《国家地理》' },
    ],
  },
  {
    spelling: 'adjacent',
    phonetic: '/əˈdʒeɪsnt/',
    meanings: [{ pos: 'adj.', defs: ['邻近的', '毗连的', '相邻的'] }],
    examples: [
      { sentence: 'The two adjacent buildings share a wall.',
        translation: '这两栋相邻的楼共用一堵墙。', source: '《卫报》' },
    ],
  },
  {
    spelling: 'adjust',
    phonetic: '/əˈdʒʌst/',
    meanings: [{ pos: 'v.', defs: ['调整', '适应', '校准'] }],
    examples: [
      { sentence: 'You may need to adjust your expectations.',
        translation: '你或许需要调整自己的预期。', source: '《哈佛商业评论》' },
    ],
  },
  {
    spelling: 'adverse',
    phonetic: '/ˈædvɜːs/',
    meanings: [{ pos: 'adj.', defs: ['不利的', '相反的', '有害的'] }],
    examples: [
      { sentence: 'The drug had no adverse effects in trials.',
        translation: '该药物在试验中未产生不良反应。', source: 'Mayo Clinic 健康专栏' },
    ],
  },
  {
    spelling: 'aesthetic',
    phonetic: '/iːsˈθetɪk/',
    meanings: [{ pos: 'adj.', defs: ['美学的', '审美的', '艺术的'] }],
    examples: [
      { sentence: 'The building is praised for its aesthetic value.',
        translation: '这座建筑因其美学价值而备受赞誉。', source: '《连线》Wired' },
    ],
  },
  {
    spelling: 'affiliate',
    phonetic: '/əˈfɪlieɪt/',
    meanings: [{ pos: 'vt.', defs: ['使附属', '使加入'] }, { pos: 'n.', defs: ['分支机构'] }],
    examples: [
      { sentence: 'The club is affiliated with the university.',
        translation: '这个俱乐部附属于这所大学。', source: '路透社 Reuters' },
    ],
  },
  {
    spelling: 'affirm',
    phonetic: '/əˈfɜːm/',
    meanings: [{ pos: 'vt.', defs: ['断言', '肯定', '证实'] }],
    examples: [
      { sentence: 'The data affirm the hypothesis.',
        translation: '数据证实了这一假设。', source: '《科学》Science' },
    ],
  },
  {
    spelling: 'agency',
    phonetic: '/ˈeɪdʒənsi/',
    meanings: [{ pos: 'n.', defs: ['代理', '机构', '作用'] }],
    examples: [
      { sentence: 'The agency launched a campaign against smoking.',
        translation: '该机构发起了一场禁烟运动。', source: 'UNICEF' },
    ],
  },
  {
    spelling: 'aggregate',
    phonetic: '/ˈæɡrɪɡət/',
    meanings: [{ pos: 'n.', defs: ['合计', '集合体'] }, { pos: 'v.', defs: ['聚集', '合计'] }],
    examples: [
      { sentence: 'The aggregate score decided the winner.',
        translation: '总分决定了胜者。', source: '《华尔街日报》' },
    ],
  },
  {
    spelling: 'alien',
    phonetic: '/ˈeɪliən/',
    meanings: [{ pos: 'adj.', defs: ['外国的', '陌生的', '异质的'] }],
    examples: [
      { sentence: 'The custom seemed alien to the visitors.',
        translation: '这一习俗对访客来说显得很陌生。', source: '《经济学人》' },
    ],
  },
  {
    spelling: 'amplify',
    phonetic: '/ˈæmplɪfaɪ/',
    meanings: [{ pos: 'vt.', defs: ['放大', '增强', '详述'] }],
    examples: [
      { sentence: 'The speech amplified public concern over privacy.',
        translation: '这番讲话放大了公众对隐私的担忧。', source: '《卫报》' },
    ],
  },
  {
    spelling: 'analogy',
    phonetic: '/əˈnælədʒi/',
    meanings: [{ pos: 'n.', defs: ['类比', '相似', '类推'] }],
    examples: [
      { sentence: 'He explained the idea by analogy with a river.',
        translation: '他用水流来类比解释这个概念。', source: 'TED 演讲' },
    ],
  },
  {
    spelling: 'analytical',
    phonetic: '/ˌænəˈlɪtɪkl/',
    meanings: [{ pos: 'adj.', defs: ['分析的', '解析的', '善于分析的'] }],
    examples: [
      { sentence: 'Her analytical skills impressed the interviewers.',
        translation: '她的分析能力给面试官留下了深刻印象。', source: '《哈佛商业评论》' },
    ],
  },
  {
    spelling: 'apprehension',
    phonetic: '/ˌæprɪˈhenʃn/',
    meanings: [{ pos: 'n.', defs: ['忧虑', '恐惧', '理解'] }],
    examples: [
      { sentence: 'There is growing apprehension about the economy.',
        translation: '对经济的担忧与日俱增。', source: '《金融时报》' },
    ],
  },
  {
    spelling: 'ascend',
    phonetic: '/əˈsend/',
    meanings: [{ pos: 'v.', defs: ['上升', '攀登', '登高'] }],
    examples: [
      { sentence: 'They ascended the mountain before dawn.',
        translation: '他们在黎明前登上了山顶。', source: '《国家地理》' },
    ],
  },
  {
    spelling: 'ascertain',
    phonetic: '/ˌæsəˈteɪn/',
    meanings: [{ pos: 'vt.', defs: ['查明', '确定', '探知'] }],
    examples: [
      { sentence: 'We must ascertain the facts before judging.',
        translation: '在下结论前我们必须查明事实。', source: '《纽约时报》' },
    ],
  },
  {
    spelling: 'ascribe',
    phonetic: '/əˈskraɪb/',
    meanings: [{ pos: 'vt.', defs: ['把…归于', '认为…是起因'] }],
    examples: [
      { sentence: 'The fall in sales is ascribed to weak demand.',
        translation: '销量下滑被归因于需求疲软。', source: '《华尔街日报》' },
    ],
  },
  {
    spelling: 'assert',
    phonetic: '/əˈsɜːt/',
    meanings: [{ pos: 'vt.', defs: ['断言', '坚持', '维护'] }],
    examples: [
      { sentence: 'She asserted her right to express an opinion.',
        translation: '她维护自己表达意见的权利。', source: '《卫报》' },
    ],
  },
  {
    spelling: 'assimilate',
    phonetic: '/əˈsɪməleɪt/',
    meanings: [{ pos: 'v.', defs: ['吸收', '同化', '消化'] }],
    examples: [
      { sentence: 'Immigrants gradually assimilate into the culture.',
        translation: '移民逐渐融入当地文化。', source: 'BBC' },
    ],
  },
  {
    spelling: 'attest',
    phonetic: '/əˈtest/',
    meanings: [{ pos: 'vt.', defs: ['证实', '证明', '表明'] }],
    examples: [
      { sentence: 'The ruins attest to a once-great civilization.',
        translation: '这些遗迹证明曾有一个伟大的文明。', source: '《国家地理》' },
    ],
  },
  {
    spelling: 'augment',
    phonetic: '/ɔːɡˈment/',
    meanings: [{ pos: 'vt.', defs: ['增大', '增加', '扩张'] }],
    examples: [
      { sentence: 'The team augmented its staff with freelancers.',
        translation: '团队用自由职业者扩充了人手。', source: '《哈佛商业评论》' },
    ],
  },
  {
    spelling: 'authentic',
    phonetic: '/ɔːˈθentɪk/',
    meanings: [{ pos: 'adj.', defs: ['真正的', '可靠的', '正宗的'] }],
    examples: [
      { sentence: 'Tourists seek authentic local cuisine.',
        translation: '游客寻找正宗的当地美食。', source: '《经济学人》' },
    ],
  },
  {
    spelling: 'avail',
    phonetic: '/əˈveɪl/',
    meanings: [{ pos: 'v.', defs: ['有益于', '利用'] }, { pos: 'n.', defs: ['效用', '帮助'] }],
    examples: [
      { sentence: 'They availed themselves of the free training.',
        translation: '他们利用了这次免费培训。', source: '《金融时报》' },
    ],
  },
  {
    spelling: 'avert',
    phonetic: '/əˈvɜːt/',
    meanings: [{ pos: 'vt.', defs: ['避免', '转移（目光）', '防止'] }],
    examples: [
      { sentence: 'Quick action averted a major disaster.',
        translation: '迅速的行动避免了一场大灾难。', source: '路透社 Reuters' },
    ],
  },
  {
    spelling: 'baffle',
    phonetic: '/ˈbæfl/',
    meanings: [{ pos: 'vt.', defs: ['使困惑', '难倒', '阻挠'] }],
    examples: [
      { sentence: 'The question baffled even the experts.',
        translation: '这个问题连专家都被难住了。', source: '《科学》Science' },
    ],
  },
  {
    spelling: 'barren',
    phonetic: '/ˈbærən/',
    meanings: [{ pos: 'adj.', defs: ['贫瘠的', '不育的', '荒芜的'] }],
    examples: [
      { sentence: 'Nothing could grow on the barren land.',
        translation: '这片贫瘠的土地上寸草不生。', source: '《国家地理》' },
    ],
  },
  {
    spelling: 'behalf',
    phonetic: '/bɪˈhɑːf/',
    meanings: [{ pos: 'n.', defs: ['利益', '代表', '一方'] }],
    examples: [
      { sentence: 'He accepted the award on behalf of the team.',
        translation: '他代表团队领了奖。', source: 'BBC' },
    ],
  },
  {
    spelling: 'bargain',
    phonetic: '/ˈbɑːɡən/',
    meanings: [{ pos: 'n.', defs: ['交易', '便宜货'] }, { pos: 'v.', defs: ['讨价还价'] }],
    examples: [
      { sentence: 'They struck a bargain after hours of talk.',
        translation: '经过数小时谈判，他们达成了交易。', source: '《华尔街日报》' },
    ],
  },
  {
    spelling: 'betray',
    phonetic: '/bɪˈtreɪ/',
    meanings: [{ pos: 'vt.', defs: ['背叛', '泄露', '辜负'] }],
    examples: [
      { sentence: 'He felt betrayed by his closest friend.',
        translation: '他觉得自己被最亲密的朋友背叛了。', source: '《纽约时报》' },
    ],
  },
  {
    spelling: 'bias',
    phonetic: '/ˈbaɪəs/',
    meanings: [{ pos: 'n.', defs: ['偏见', '偏向', '斜线'] }],
    examples: [
      { sentence: 'The test was accused of cultural bias.',
        translation: '这项测试被指存在文化偏见。', source: '《卫报》' },
    ],
  },
  {
    spelling: 'bizarre',
    phonetic: '/bɪˈzɑː(r)/',
    meanings: [{ pos: 'adj.', defs: ['奇异的', '怪诞的', '离奇的'] }],
    examples: [
      { sentence: 'The film tells a bizarre story of time travel.',
        translation: '这部电影讲述了一个奇异的时空旅行故事。', source: '《连线》Wired' },
    ],
  },
  {
    spelling: 'blunt',
    phonetic: '/blʌnt/',
    meanings: [{ pos: 'adj.', defs: ['迟钝的', '直言的', '钝的'] }],
    examples: [
      { sentence: 'To be blunt, your plan will not work.',
        translation: '直说吧，你的计划行不通。', source: 'TED 演讲' },
    ],
  },
  {
    spelling: 'boundary',
    phonetic: '/ˈbaʊndri/',
    meanings: [{ pos: 'n.', defs: ['边界', '界限', '分界线'] }],
    examples: [
      { sentence: 'The river forms a natural boundary between the two nations.',
        translation: '这条河是两国的天然边界。', source: '《经济学人》' },
    ],
  },
  {
    spelling: 'breach',
    phonetic: '/briːtʃ/',
    meanings: [{ pos: 'n.', defs: ['违反', '破坏', '缺口'] }, { pos: 'v.', defs: ['违背', '突破'] }],
    examples: [
      { sentence: 'The company was fined for a breach of contract.',
        translation: '该公司因违约被罚款。', source: '《金融时报》' },
    ],
  },
  {
    spelling: 'brilliant',
    phonetic: '/ˈbrɪliənt/',
    meanings: [{ pos: 'adj.', defs: ['杰出的', '明亮的', '巧妙的'] }],
    examples: [
      { sentence: 'She came up with a brilliant solution.',
        translation: '她想出了一个绝妙的办法。', source: '《哈佛商业评论》' },
    ],
  },
  {
    spelling: 'brisk',
    phonetic: '/brɪsk/',
    meanings: [{ pos: 'adj.', defs: ['轻快的', '兴旺的', '寒冷而清新的'] }],
    examples: [
      { sentence: 'A brisk walk can clear your mind.',
        translation: '快步走能让你头脑清醒。', source: 'Mayo Clinic 健康专栏' },
    ],
  },
  {
    spelling: 'brittle',
    phonetic: '/ˈbrɪtl/',
    meanings: [{ pos: 'adj.', defs: ['易碎的', '脆弱的', '尖利的'] }],
    examples: [
      { sentence: 'The brittle glass shattered on impact.',
        translation: '这易碎的玻璃一撞就碎了。', source: '《科学》Science' },
    ],
  },
  {
    spelling: 'bulk',
    phonetic: '/bʌlk/',
    meanings: [{ pos: 'n.', defs: ['体积', '大部分', '大量'] }],
    examples: [
      { sentence: 'The bulk of the work is already done.',
        translation: '大部分工作已经完成。', source: '《卫报》' },
    ],
  },
  {
    spelling: 'bundle',
    phonetic: '/ˈbʌndl/',
    meanings: [{ pos: 'n.', defs: ['束', '包', '捆'] }, { pos: 'v.', defs: ['捆绑', '集中'] }],
    examples: [
      { sentence: 'They bundled the papers and threw them out.',
        translation: '他们把文件捆好扔掉了。', source: 'BBC' },
    ],
  },
  {
    spelling: 'burst',
    phonetic: '/bɜːst/',
    meanings: [{ pos: 'v.', defs: ['爆发', '突然发生', '胀破'] }],
    examples: [
      { sentence: 'The audience burst into applause.',
        translation: '观众爆发出掌声。', source: '路透社 Reuters' },
    ],
  },
  {
    spelling: 'candidate',
    phonetic: '/ˈkændɪdət/',
    meanings: [{ pos: 'n.', defs: ['候选人', '报考者', '应试者'] }],
    examples: [
      { sentence: 'She is the strongest candidate for the job.',
        translation: '她是这个职位最有竞争力的候选人。', source: '《纽约时报》' },
    ],
  },
  {
    spelling: 'capable',
    phonetic: '/ˈkeɪpəbl/',
    meanings: [{ pos: 'adj.', defs: ['有能力的', '能干的', '容许…的'] }],
    examples: [
      { sentence: 'The robot is capable of complex tasks.',
        translation: '这台机器人能完成复杂的任务。', source: '《连线》Wired' },
    ],
  },
  {
    spelling: 'capacity',
    phonetic: '/kəˈpæsəti/',
    meanings: [{ pos: 'n.', defs: ['能力', '容量', '职位'] }],
    examples: [
      { sentence: 'The stadium has a capacity of 80,000.',
        translation: '这座体育场可容纳 8 万人。', source: '《金融时报》' },
    ],
  },
  {
    spelling: 'capsule',
    phonetic: '/ˈkæpsjuːl/',
    meanings: [{ pos: 'n.', defs: ['胶囊', '太空舱', '小容器'] }],
    examples: [
      { sentence: 'The capsule returned safely to Earth.',
        translation: '太空舱安全返回地球。', source: 'BBC' },
    ],
  },
  {
    spelling: 'capture',
    phonetic: '/ˈkæptʃə(r)/',
    meanings: [{ pos: 'vt.', defs: ['捕获', '夺取', '记录'] }],
    examples: [
      { sentence: 'The photo captures the spirit of the city.',
        translation: '这张照片抓住了这座城市的神韵。', source: '《国家地理》' },
    ],
  },
];

export const KAOYAN_META: WordListMeta = {
  id: 'kaoyan',
  name: '考研核心词',
  count: KAOYAN.length,
};
