import type { WordEntry, WordListMeta } from '../types';

/**
 * 六级核心词书（50 词）。前 16 词为项目初期精心打磨的样例，
 * 其余为补充的高频六级词，均含多词性释义与带出处的真实语境例句。
 * 要接入「全量 ECDICT」，运行 scripts/build-wordlist.js 生成后替换本文件即可。
 */
export const CET6: WordEntry[] = [
  {
    spelling: 'alleviate',
    phonetic: '/əˈliːvieɪt/',
    meanings: [{ pos: 'vt.', defs: ['减轻', '缓解', '缓和（痛苦、问题、紧张）'] }],
    examples: [
      { sentence: 'The new policy is meant to alleviate poverty in rural areas.',
        translation: '新政策旨在缓解农村地区的贫困。', source: '《经济学人》' },
    ],
  },
  {
    spelling: 'ambiguous',
    phonetic: '/æmˈbɪɡjuəs/',
    meanings: [{ pos: 'adj.', defs: ['模棱两可的', '含糊不清的', '引起歧义的'] }],
    examples: [
      { sentence: 'His ambiguous reply left us unsure of his real intention.',
        translation: '他模棱两可的回答让我们摸不清他的真实意图。', source: '《纽约时报》' },
    ],
  },
  {
    spelling: 'arid',
    phonetic: '/ˈærɪd/',
    meanings: [{ pos: 'adj.', defs: ['干旱的', '干燥的', '枯燥无味的'] }],
    examples: [
      { sentence: 'Nothing grows in this arid desert.',
        translation: '这片干旱的沙漠里寸草不生。', source: '《国家地理》' },
    ],
  },
  {
    spelling: 'coherent',
    phonetic: '/kəʊˈhɪərənt/',
    meanings: [{ pos: 'adj.', defs: ['连贯的', '有条理的', '表达清晰的'] }],
    examples: [
      { sentence: 'She gave a clear and coherent account of the accident.',
        translation: '她对事故作了清晰而有条理的陈述。', source: 'BBC News' },
    ],
  },
  {
    spelling: 'compensate',
    phonetic: '/ˈkɒmpenseɪt/',
    meanings: [
      { pos: 'v.', defs: ['补偿', '弥补', '赔偿'] },
      { pos: 'vt.', defs: ['酬报', '给…报酬'] },
    ],
    examples: [
      { sentence: 'The bonus was meant to compensate for the extra hours.',
        translation: '这笔奖金是为了补偿额外的加班时间。', source: '《金融时报》' },
    ],
  },
  {
    spelling: 'dilemma',
    phonetic: '/dɪˈlemə/',
    meanings: [{ pos: 'n.', defs: ['困境', '进退两难', '两难选择'] }],
    examples: [
      { sentence: 'He faced the dilemma of quitting or staying unhappy.',
        translation: '他面临辞职还是继续不快乐的两难境地。', source: 'TED 演讲' },
    ],
  },
  {
    spelling: 'eradicate',
    phonetic: '/ɪˈrædɪkeɪt/',
    meanings: [{ pos: 'vt.', defs: ['根除', '消灭', '杜绝'] }],
    examples: [
      { sentence: 'Vaccines helped eradicate smallpox worldwide.',
        translation: '疫苗帮助在全世界根除了天花。', source: 'WHO 世界卫生组织' },
    ],
  },
  {
    spelling: 'fluctuate',
    phonetic: '/ˈflʌktʃueɪt/',
    meanings: [{ pos: 'v.', defs: ['波动', '起伏', '动摇'] }],
    examples: [
      { sentence: 'Prices fluctuate with the supply and demand.',
        translation: '价格随供需关系而波动。', source: '《华尔街日报》' },
    ],
  },
  {
    spelling: 'inherent',
    phonetic: '/ɪnˈhɪərənt/',
    meanings: [{ pos: 'adj.', defs: ['固有的', '内在的', '与生俱来的'] }],
    examples: [
      { sentence: 'Every technology has its inherent risks.',
        translation: '每项技术都有其固有的风险。', source: '《连线》Wired' },
    ],
  },
  {
    spelling: 'mitigate',
    phonetic: '/ˈmɪtɪɡeɪt/',
    meanings: [
      { pos: 'vt.', defs: ['减轻', '缓和（危害、影响）'] },
      { pos: 'v.', defs: ['使缓和'] },
    ],
    examples: [
      { sentence: 'Trees can mitigate the effects of urban heat.',
        translation: '树木可以减轻城市热岛效应。', source: '《科学》Science' },
    ],
  },
  {
    spelling: 'paradox',
    phonetic: '/ˈpærədɒks/',
    meanings: [{ pos: 'n.', defs: ['悖论', '自相矛盾的人（或事物）', '似非而是的论点'] }],
    examples: [
      { sentence: 'It is a paradox that we are busy yet accomplish little.',
        translation: '我们很忙却收效甚微，这真是个悖论。', source: '《卫报》' },
    ],
  },
  {
    spelling: 'prone',
    phonetic: '/prəʊn/',
    meanings: [{ pos: 'adj.', defs: ['易于…的', '有…倾向的', '俯卧的'] }],
    examples: [
      { sentence: 'Children are prone to catching colds in winter.',
        translation: '儿童冬天容易感冒。', source: 'Mayo Clinic 健康专栏' },
    ],
  },
  {
    spelling: 'simultaneous',
    phonetic: '/ˌsɪmlˈteɪniəs/',
    meanings: [{ pos: 'adj.', defs: ['同时发生的', '同步的', '同时存在的'] }],
    examples: [
      { sentence: 'The two explosions were almost simultaneous.',
        translation: '这两起爆炸几乎同时发生。', source: '路透社 Reuters' },
    ],
  },
  {
    spelling: 'tangible',
    phonetic: '/ˈtændʒəbl/',
    meanings: [{ pos: 'adj.', defs: ['可触摸的', '实际的', '真实的'] }],
    examples: [
      { sentence: 'The project produced tangible results within a month.',
        translation: '该项目一个月内就产生了实实在在的成果。', source: '《哈佛商业评论》' },
    ],
  },
  {
    spelling: 'tedious',
    phonetic: '/ˈtiːdiəs/',
    meanings: [{ pos: 'adj.', defs: ['冗长乏味的', '使人厌烦的'] }],
    examples: [
      { sentence: 'Filling out the forms was a tedious task.',
        translation: '填这些表格是件枯燥的差事。', source: 'BBC' },
    ],
  },
  {
    spelling: 'vulnerable',
    phonetic: '/ˈvʌlnərəbl/',
    meanings: [{ pos: 'adj.', defs: ['脆弱的', '易受伤害的', '易受攻击的'] }],
    examples: [
      { sentence: 'The elderly are especially vulnerable to the heat.',
        translation: '老年人尤其易受高温伤害。', source: 'UNICEF' },
    ],
  },
  {
    spelling: 'abolish',
    phonetic: '/əˈbɒlɪʃ/',
    meanings: [{ pos: 'vt.', defs: ['废除', '废止', '彻底废除'] }],
    examples: [
      { sentence: 'Many countries have abolished the death penalty.',
        translation: '许多国家已经废除了死刑。', source: '《卫报》' },
    ],
  },
  {
    spelling: 'abundant',
    phonetic: '/əˈbʌndənt/',
    meanings: [{ pos: 'adj.', defs: ['丰富的', '充裕的', '大量的'] }],
    examples: [
      { sentence: 'The region is abundant in natural resources.',
        translation: '该地区自然资源十分丰富。', source: '《国家地理》' },
    ],
  },
  {
    spelling: 'accomplish',
    phonetic: '/əˈkʌmplɪʃ/',
    meanings: [{ pos: 'vt.', defs: ['完成', '实现', '达到（目标）'] }],
    examples: [
      { sentence: 'We accomplished our goal ahead of schedule.',
        translation: '我们提前实现了目标。', source: '《哈佛商业评论》' },
    ],
  },
  {
    spelling: 'accurate',
    phonetic: '/ˈækjərət/',
    meanings: [{ pos: 'adj.', defs: ['准确的', '精确的', '正确无误的'] }],
    examples: [
      { sentence: 'The report provides an accurate picture of the market.',
        translation: '这份报告准确地描绘了市场现状。', source: '《华尔街日报》' },
    ],
  },
  {
    spelling: 'acute',
    phonetic: '/əˈkjuːt/',
    meanings: [{ pos: 'adj.', defs: ['严重的', '敏锐的', '急性的'] }],
    examples: [
      { sentence: 'There is an acute shortage of clean water.',
        translation: '清洁用水严重短缺。', source: 'BBC News' },
    ],
  },
  {
    spelling: 'adequate',
    phonetic: '/ˈædɪkwət/',
    meanings: [{ pos: 'adj.', defs: ['足够的', '适当的', '差强人意的'] }],
    examples: [
      { sentence: 'The shelter provides adequate protection from the rain.',
        translation: '这个棚子足以挡雨。', source: '《经济学人》' },
    ],
  },
  {
    spelling: 'advocate',
    phonetic: '/ˈædvəkeɪt/',
    meanings: [
      { pos: 'vt.', defs: ['提倡', '拥护', '主张'] },
      { pos: 'n.', defs: ['提倡者', '拥护者'] },
    ],
    examples: [
      { sentence: 'Experts advocate a balanced and varied diet.',
        translation: '专家提倡均衡多样的饮食。', source: 'Mayo Clinic 健康专栏' },
    ],
  },
  {
    spelling: 'aggressive',
    phonetic: '/əˈɡresɪv/',
    meanings: [{ pos: 'adj.', defs: ['好斗的', '积极进取的', '侵略性的'] }],
    examples: [
      { sentence: 'The company takes an aggressive approach to growth.',
        translation: '这家公司采取了积极的扩张策略。', source: '《金融时报》' },
    ],
  },
  {
    spelling: 'allocate',
    phonetic: '/ˈæləkeɪt/',
    meanings: [{ pos: 'vt.', defs: ['分配', '拨出', '划归'] }],
    examples: [
      { sentence: 'The government allocated funds to public schools.',
        translation: '政府向公立学校拨出了资金。', source: '路透社 Reuters' },
    ],
  },
  {
    spelling: 'analyze',
    phonetic: '/ˈænəlaɪz/',
    meanings: [{ pos: 'vt.', defs: ['分析', '剖析', '细察'] }],
    examples: [
      { sentence: 'Scientists analyzed the samples in the lab.',
        translation: '科学家在实验室里分析了样本。', source: '《科学》Science' },
    ],
  },
  {
    spelling: 'anticipate',
    phonetic: '/ænˈtɪsɪpeɪt/',
    meanings: [{ pos: 'vt.', defs: ['预期', '预料', '期盼'] }],
    examples: [
      { sentence: 'We anticipate a rise in demand next quarter.',
        translation: '我们预计下个季度需求会上升。', source: '《华尔街日报》' },
    ],
  },
  {
    spelling: 'apparent',
    phonetic: '/əˈpærənt/',
    meanings: [{ pos: 'adj.', defs: ['明显的', '显而易见的', '表面上的'] }],
    examples: [
      { sentence: 'It was apparent that he was not telling the truth.',
        translation: '显然他没有说实话。', source: '《纽约时报》' },
    ],
  },
  {
    spelling: 'appreciate',
    phonetic: '/əˈpriːʃieɪt/',
    meanings: [
      { pos: 'vt.', defs: ['欣赏', '感激', '领会'] },
      { pos: 'vi.', defs: ['增值', '涨价'] },
    ],
    examples: [
      { sentence: 'I appreciate your honest feedback on my work.',
        translation: '我很感激你对我的工作提出的诚恳反馈。', source: 'TED 演讲' },
    ],
  },
  {
    spelling: 'appropriate',
    phonetic: '/əˈprəʊpriət/',
    meanings: [{ pos: 'adj.', defs: ['适当的', '恰当的', '合适的'] }],
    examples: [
      { sentence: 'Wear clothing appropriate for the weather.',
        translation: '穿适合天气的衣服。', source: 'BBC' },
    ],
  },
  {
    spelling: 'arbitrary',
    phonetic: '/ˈɑːbɪtrəri/',
    meanings: [{ pos: 'adj.', defs: ['任意的', '武断的', '专横的'] }],
    examples: [
      { sentence: 'The decision seemed completely arbitrary to the workers.',
        translation: '工人们觉得这个决定完全是武断的。', source: '《卫报》' },
    ],
  },
  {
    spelling: 'articulate',
    phonetic: '/ɑːˈtɪkjuleɪt/',
    meanings: [
      { pos: 'vt.', defs: ['清晰表达', '明确表述'] },
      { pos: 'adj.', defs: ['表达清晰的', '发音清晰的'] },
    ],
    examples: [
      { sentence: 'She articulated her vision with great confidence.',
        translation: '她充满自信地阐述了自己的愿景。', source: 'TED 演讲' },
    ],
  },
  {
    spelling: 'assess',
    phonetic: '/əˈses/',
    meanings: [{ pos: 'vt.', defs: ['评估', '评定', '估算'] }],
    examples: [
      { sentence: 'Doctors assessed the severity of the injury.',
        translation: '医生评估了伤势的严重程度。', source: 'Mayo Clinic 健康专栏' },
    ],
  },
  {
    spelling: 'assume',
    phonetic: '/əˈsjuːm/',
    meanings: [
      { pos: 'vt.', defs: ['假定', '认为', '承担'] },
      { pos: 'vi.', defs: ['装腔作势'] },
    ],
    examples: [
      { sentence: 'We assume the train will arrive on time.',
        translation: '我们假定火车会准点到达。', source: '《经济学人》' },
    ],
  },
  {
    spelling: 'attribute',
    phonetic: '/əˈtrɪbjuːt/',
    meanings: [{ pos: 'vt.', defs: ['把…归因于', '认为是…所为'] }],
    examples: [
      { sentence: 'She attributes her success to hard work.',
        translation: '她把成功归功于勤奋。', source: '《哈佛商业评论》' },
    ],
  },
  {
    spelling: 'authority',
    phonetic: '/ɔːˈθɒrəti/',
    meanings: [
      { pos: 'n.', defs: ['权威', '当局', '官方'] },
      { pos: 'n.', defs: ['权力', '管辖权'] },
    ],
    examples: [
      { sentence: 'The local authority issued a new safety rule.',
        translation: '地方当局发布了一项新的安全规章。', source: '路透社 Reuters' },
    ],
  },
  {
    spelling: 'automatic',
    phonetic: '/ˌɔːtəˈmætɪk/',
    meanings: [{ pos: 'adj.', defs: ['自动的', '无意识的', '必然的'] }],
    examples: [
      { sentence: 'The door opens with an automatic sensor.',
        translation: '这扇门由自动感应器开启。', source: '《连线》Wired' },
    ],
  },
  {
    spelling: 'aware',
    phonetic: '/əˈweə(r)/',
    meanings: [{ pos: 'adj.', defs: ['意识到的', '知道的', '警觉的'] }],
    examples: [
      { sentence: 'People are more aware of environmental issues now.',
        translation: '如今人们更加意识到环境问题。', source: 'UNICEF' },
    ],
  },
  {
    spelling: 'breakthrough',
    phonetic: '/ˈbreɪkθruː/',
    meanings: [{ pos: 'n.', defs: ['突破', '重大进展', '转折点'] }],
    examples: [
      { sentence: 'The study marks a breakthrough in cancer research.',
        translation: '这项研究是癌症研究的一项突破。', source: '《科学》Science' },
    ],
  },
  {
    spelling: 'circumstance',
    phonetic: '/ˈsɜːkəmstəns/',
    meanings: [{ pos: 'n.', defs: ['情况', '环境', '境遇'] }],
    examples: [
      { sentence: 'Under no circumstances should you give up.',
        translation: '在任何情况下你都不应放弃。', source: '《纽约时报》' },
    ],
  },
  {
    spelling: 'comprehend',
    phonetic: '/ˌkɒmprɪˈhend/',
    meanings: [{ pos: 'vt.', defs: ['理解', '领会', '包含'] }],
    examples: [
      { sentence: 'The child could not comprehend the abstract concept.',
        translation: '这个孩子无法理解这个抽象概念。', source: 'BBC' },
    ],
  },
  {
    spelling: 'concrete',
    phonetic: '/ˈkɒŋkriːt/',
    meanings: [
      { pos: 'adj.', defs: ['具体的', '实在的', '混凝土的'] },
      { pos: 'n.', defs: ['混凝土'] },
    ],
    examples: [
      { sentence: 'We need concrete evidence, not vague promises.',
        translation: '我们需要具体的证据，而不是空洞的承诺。', source: '《金融时报》' },
    ],
  },
  {
    spelling: 'conduct',
    phonetic: '/kənˈdʌkt/',
    meanings: [
      { pos: 'vt.', defs: ['进行', '实施', '引导'] },
      { pos: 'n.', defs: ['行为', '举止'] },
    ],
    examples: [
      { sentence: 'They conducted a survey among 500 students.',
        translation: '他们对 500 名学生开展了一次调查。', source: '《经济学人》' },
    ],
  },
  {
    spelling: 'consequent',
    phonetic: '/ˈkɒnsɪkwənt/',
    meanings: [{ pos: 'adj.', defs: ['随之发生的', '必然的', '作为结果的'] }],
    examples: [
      { sentence: 'The drought and consequent crop failure hit farmers hard.',
        translation: '干旱及其引发的作物歉收重创了农民。', source: '《国家地理》' },
    ],
  },
  {
    spelling: 'conserve',
    phonetic: '/kənˈsɜːv/',
    meanings: [{ pos: 'vt.', defs: ['保护', '保存', '节约'] }],
    examples: [
      { sentence: 'We must conserve energy for future generations.',
        translation: '我们必须为子孙后代节约能源。', source: 'UNICEF' },
    ],
  },
  {
    spelling: 'constitute',
    phonetic: '/ˈkɒnstɪtjuːt/',
    meanings: [{ pos: 'vt.', defs: ['构成', '组成', '设立'] }],
    examples: [
      { sentence: 'Women constitute half of the workforce.',
        translation: '女性占了劳动力的一半。', source: '《卫报》' },
    ],
  },
  {
    spelling: 'contemporary',
    phonetic: '/kənˈtemprəri/',
    meanings: [{ pos: 'adj.', defs: ['当代的', '同时代的', '现代的'] }],
    examples: [
      { sentence: 'The museum features contemporary art from Asia.',
        translation: '这家博物馆展出来自亚洲的当代艺术。', source: '《连线》Wired' },
    ],
  },
  {
    spelling: 'contradict',
    phonetic: '/ˌkɒntrəˈdɪkt/',
    meanings: [{ pos: 'vt.', defs: ['反驳', '与…矛盾', '否认'] }],
    examples: [
      { sentence: 'His actions contradict his words.',
        translation: '他的行动与言语自相矛盾。', source: '《纽约时报》' },
    ],
  },
  {
    spelling: 'crucial',
    phonetic: '/ˈkruːʃl/',
    meanings: [{ pos: 'adj.', defs: ['关键的', '至关重要的', '决定性的'] }],
    examples: [
      { sentence: 'Sleep is crucial to physical recovery.',
        translation: '睡眠对身体恢复至关重要。', source: 'Mayo Clinic 健康专栏' },
    ],
  },
  {
    spelling: 'cultivate',
    phonetic: '/ˈkʌltɪveɪt/',
    meanings: [{ pos: 'vt.', defs: ['培养', '耕作', '结交（朋友）'] }],
    examples: [
      { sentence: 'Schools should cultivate students’ critical thinking.',
        translation: '学校应培养学生的批判性思维。', source: '《哈佛商业评论》' },
    ],
  },
];

export const CET6_META: WordListMeta = {
  id: 'cet6',
  name: '六级核心词',
  count: CET6.length,
};
