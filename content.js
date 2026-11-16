// Personal website content. Update this file to maintain profile and experience.
window.PORTFOLIO = {
  name: '王方仪',
  englishName: 'FANGYI WANG',
  role: '求职目标：产品经理 / AI 产品',
  introduction: '',
  contacts: [
    { label: '电话', text: '15915400913', href: 'tel:15915400913' },
    { label: '邮箱', text: 'wfy_2004@qq.com', href: 'mailto:wfy_2004@qq.com' }
  ],
  tags: ['统计学背景', '产品与需求', 'AI 应用与评测'],
  resumeUrl: './王方仪-统计学-产品经理.pdf',
  sections: [
    {
      id: 'education', number: '01', title: '教育背景', english: 'EDUCATION',
      summary: '统计学本科 · 统计与数据科学硕士已录取',
      subtitle: '以统计为基础，在数据与技术之间持续探索。',
      entries: [
        { label: '01 / UNDERGRADUATE', title: '香港中文大学（深圳）',
          meta: '统计学 · 本科 ｜ 2023.09 — 2027.07',
          text: '绩点：3.7 / 4.0',
          bullets: ['主要课程：概率统计、统计推断、机器学习、深度学习、强化学习、数据结构等。'],
          tags: ['统计学', '机器学习', '数据结构'] },
        { label: '02 / POSTGRADUATE · ADMITTED', title: '香港中文大学',
          meta: '统计与数据科学高等研究项目 · 硕士已录取',
          text: '预计 2027.09 入学，2028.07 毕业。',
          tags: ['硕士已录取', '统计与数据科学'] }
      ]
    },
    {
      id: 'experience', number: '02', title: '实习经历', english: 'EXPERIENCE',
      summary: '汇丰软件开发 · 深圳大数据研究院',
      subtitle: '把业务需求转成可执行的规则，把 AI 能力变成可信的服务。',
      entries: [
        { label: '01 / PRODUCT MANAGEMENT', title: '汇丰软件开发（广州）',
          meta: '产品经理 ｜ 2026.07 — 2026.10',
          tags: ['toB 产品', '需求分析', 'SQL', '产品评测'],
          text: '支付后台存在重复支付误判、合规字段缺失等问题，很多情况需要依赖人工复核。',
          bullets: [
            '需求翻译：把运营的模糊需求拆成系统能执行的判断规则，降低复核成本和业务风险。',
            '防重复支付：用 SQL 截取交易水印特征，帮助系统识别重复支付，减少误判。',
            'NRA 合规：用条件判断自动给非居民账户加 NRA 前缀，省去手工筛选。',
            '上线保障：补充空值、超长字符、特殊格式等边界测试；增加回退和报错阻断，避免错误数据流到下游。'
          ] },
        { label: '02 / RESEARCH & RAG', title: '深圳大数据研究院',
          meta: '科研助理 ｜ 2025.05 — 2025.12',
          tags: ['RAG', '防幻觉', '评测体系'],
          links: [{ label: '查看 GitHub 项目', url: 'https://github.com/NATwwww/Chordoma_RAG' }],
          text: '医学文献难读，大模型容易“编”且缺乏原文依据。主导设计脊索瘤 RAG 问答系统，做“有出处、有边界”的医学查询。',
          bullets: [
            '防断章取义：针对文献跨页导致条件断裂的问题，用“混合召回 + 重排 + 邻近扩展”补齐上下文。',
            '防幻觉：回答必须带原文出处；证据不足时系统直接拦截，避免模型在缺乏依据时生成答案。',
            '评测方法：把“答得好不好”拆成要点完整度、整题通过率等客观指标，按 Badcase 迭代。'
          ],
          result: '要点完整度 84.9% → 96.0%；核心任务解决率 66.7% → 95.8%。115 条引用全部定位到原文页码，运行成功率 100%。' }
      ]
    },
    {
      id: 'projects', number: '03', title: '项目经历', english: 'SELECTED PROJECTS',
      summary: '数据处理 Agent · 持续学习 · R 开源工具',
      subtitle: '从产品交付到研究探索，让想法有实现、有验证。',
      entries: [
        { label: '01 / AI PRODUCT', title: '智能数据处理 Agent',
          meta: '独立产品项目 ｜ 2026.09 — 2026.10',
          links: [{ label: '体验 SheetPilot', url: 'https://sheetpilot-3pin.onrender.com' }],
          tags: ['LLM Agent', '表格处理', 'AI 产品评测'],
          text: '用户不信任 AI 直接改表，需求又常说不清，因此将产品定位为“结果可审查、操作可回退”。',
          bullets: [
            '场景覆盖：清洗、匹配、汇总等 8 类高频表格处理场景。',
            '链路拆分：LLM 只负责理解需求、生成任务单；执行交给代码，规则引擎先校验条件，缺信息自动追问。',
            '执行保障：审批前置、文件副本隔离、分步检查点，出错能回退，交付可控。'
          ],
          result: '模块测试通过率 63.3% → 100%；端到端失败任务补测通过率 75.6%。' },
        { label: '02 / CONTINUAL LEARNING', title: '多级记忆树（HMT）与持续学习',
          meta: '一作 · AISTATS 在投 ｜ 2026.04 — 2026.09',
          tags: ['持续学习', '记忆管理'],
          text: 'AI 持续学习新数据时容易忘记旧知识，也容易被新信息反复覆盖。',
          bullets: [
            '我的工作：设计框架核心的“唤醒阶段控制器”，决定何时调用旧记忆、何时写入新记忆。',
            '机制设计：用惊讶度、新颖度、复发度等动态证据，控制检索情境记忆、调整工作记忆、生成记忆候选、沉淀语义记忆。',
            '实验验证：通过对比和消融实验验证策略有效。'
          ],
          result: '向后迁移 −0.484 → −0.175；长期遗忘率 0.145；NLL 3.129。' },
        { label: '03 / OPEN SOURCE', title: '基于文本的情感分类 R 语言工具包',
          meta: '开源项目 ｜ CRAN: text2emotion',
          links: [{ label: '查看 GitHub 项目', url: 'https://github.com/NATwwww/text2emotion' }],
          tags: ['R', 'CRAN', '文本情绪分类', '开源'],
          text: '把自由文本分成五类情绪，并输出对应 emoji。',
          bullets: [
            '实现方法：用 TF-IDF 表示文本，再以随机森林进行分类。',
            '工程化：把预处理和推理流程打包成 R 包，保证可复现。',
            '发布：已发布到 CRAN（text2emotion），R 用户可直接安装使用。',
            '价值：让文本情绪分类从“跑脚本”变成可复用的开源工具。'
          ] }
      ]
    },
    {
      id: 'skills', number: '04', title: '专业技能', english: 'TOOLKIT & EXPERTISE',
      summary: '产品 × 数据 × AI 工程 × 评测',
      subtitle: '理解需求，用数据判断，用工程实现，用评测迭代。',
      entries: [
        { label: '01 / PRODUCT & REQUIREMENTS', title: '产品与需求',
          text: '能把运营或用户的模糊需求翻译成系统规则和业务流程。',
          tags: ['用户调研', '竞品分析', '需求拆解', '优先级规划', 'PRD', '原型设计'],
          tools: 'Figma · Xmind' },
        { label: '02 / DATA & STATISTICS', title: '数据分析与统计',
          text: '统计学科班背景，能用数据做清洗、分析和看板呈现。',
          tags: ['统计分析', 'SQL 查询', '数据清洗', '可视化看板'],
          tools: 'Python · SQL · Excel · PowerBI · Tableau' },
        { label: '03 / CODE & AI ENGINEERING', title: '代码与 AI 工程',
          text: '能快速搭建 AI 应用原型，也能把流程工程化、可复现。',
          tags: ['Python', 'R', 'LangChain', 'RAG', 'Agent', 'Prompt', 'Vibe Coding', 'YOLOv11 微调'],
          evidence: '搭建过 RAG 问答系统和数据处理 Agent；R 包已发布到 CRAN。' },
        { label: '04 / EVALUATION & EXPERIMENTS', title: '评测与实验',
          text: '不只凭感觉判断“好不好用”，会把主观体验拆成可量化指标。',
          tags: ['评测体系设计', 'Badcase 归因', '边界测试', '消融实验', '量化迭代'],
          evidence: '做过 RAG 四层评测、Agent 双层评测和模型消融实验。' },
        { label: '05 / LANGUAGE & COMMUNICATION', title: '语言与沟通',
          text: '英语雅思 7.5，能阅读英文论文和技术文档，进行日常英文沟通。',
          tags: ['IELTS 7.5', '英文文献阅读', '技术文档', '跨团队沟通'] }
      ]
    }
  ]
};
