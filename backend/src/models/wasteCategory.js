// 垃圾类别模型

/**
 * 垃圾类别数据模型
 * 定义系统支持的各种垃圾类别及其属性
 */
class WasteCategory {
  constructor() {
    // 垃圾类别数据
    this.categories = {
      recyclable: {
        id: 'recyclable',
        name: {
          zh: '可回收物',
          en: 'Recyclable'
        },
        description: {
          zh: '适宜回收和资源利用的垃圾',
          en: 'Waste suitable for recycling and resource utilization'
        },
        examples: {
          zh: '废纸、塑料、玻璃、金属、布料等',
          en: 'Waste paper, plastic, glass, metal, fabric, etc.'
        },
        icon: '♻️',
        color: '#4CAF50'
      },
      kitchen: {
        id: 'kitchen',
        name: {
          zh: '厨余垃圾',
          en: 'Kitchen Waste'
        },
        description: {
          zh: '易腐的生物质生活废弃物',
          en: 'Perishable biomass domestic waste'
        },
        examples: {
          zh: '剩菜剩饭、果皮、蔬菜茎叶、骨头等',
          en: 'Leftovers, fruit peels, vegetable stems and leaves, bones, etc.'
        },
        icon: '🍎',
        color: '#8BC34A'
      },
      hazardous: {
        id: 'hazardous',
        name: {
          zh: '有害垃圾',
          en: 'Hazardous Waste'
        },
        description: {
          zh: '对人体健康或者自然环境造成直接或者潜在危害的生活废弃物',
          en: 'Household waste that causes direct or potential harm to human health or the natural environment'
        },
        examples: {
          zh: '电池、荧光灯管、灯泡、水银温度计、油漆桶等',
          en: 'Batteries, fluorescent tubes, bulbs, mercury thermometers, paint buckets, etc.'
        },
        icon: '⚠️',
        color: '#FF9800'
      },
      other: {
        id: 'other',
        name: {
          zh: '其他垃圾',
          en: 'Other Waste'
        },
        description: {
          zh: '除可回收物、厨余垃圾、有害垃圾之外的其他生活废弃物',
          en: 'Other domestic waste besides recyclables, kitchen waste and hazardous waste'
        },
        examples: {
          zh: '砖瓦陶瓷、渣土、卫生间废纸、纸巾等难以回收的废弃物',
          en: 'Bricks and ceramics,渣土, toilet paper, tissues and other difficult-to-recycle waste'
        },
        icon: '🚮',
        color: '#9E9E9E'
      }
    };
  }

  /**
   * 获取所有垃圾类别
   * @returns {Object} 所有垃圾类别数据
   */
  getAllCategories() {
    return this.categories;
  }

  /**
   * 根据ID获取垃圾类别
   * @param {string} categoryId - 垃圾类别ID
   * @returns {Object|null} 垃圾类别数据或null
   */
  getCategoryById(categoryId) {
    return this.categories[categoryId] || null;
  }

  /**
   * 检查是否为有效垃圾类别
   * @param {string} categoryId - 垃圾类别ID
   * @returns {boolean} 是否为有效类别
   */
  isValidCategory(categoryId) {
    return Object.keys(this.categories).includes(categoryId);
  }

  /**
   * 获取本地化的垃圾类别数据
   * @param {string} lang - 语言代码 (zh/en)
   * @returns {Object} 本地化的垃圾类别数据
   */
  getLocalizedCategories(lang = 'zh') {
    const localized = {};
    for (const [key, category] of Object.entries(this.categories)) {
      localized[key] = {
        id: category.id,
        name: category.name[lang] || category.name.zh,
        description: category.description[lang] || category.description.zh,
        examples: category.examples[lang] || category.examples.zh,
        icon: category.icon,
        color: category.color
      };
    }
    return localized;
  }

  /**
   * 获取本地化的单个垃圾类别
   * @param {string} categoryId - 垃圾类别ID
   * @param {string} lang - 语言代码 (zh/en)
   * @returns {Object|null} 本地化的垃圾类别数据或null
   */
  getLocalizedCategory(categoryId, lang = 'zh') {
    const category = this.getCategoryById(categoryId);
    if (!category) return null;
    
    return {
      id: category.id,
      name: category.name[lang] || category.name.zh,
      description: category.description[lang] || category.description.zh,
      examples: category.examples[lang] || category.examples.zh,
      icon: category.icon,
      color: category.color
    };
  }
}

module.exports = new WasteCategory();