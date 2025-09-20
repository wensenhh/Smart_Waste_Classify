import { createApp } from 'vue';
import Modal from '../components/Modal.vue';
import MessageToast from '../components/MessageToast.vue';
import { useI18n } from 'vue-i18n';

// 创建临时应用实例以获取i18n实例
const getI18nInstance = () => {
  // 尝试直接获取已存在的i18n实例
  try {
    return useI18n();
  } catch (error) {
    // 如果失败，返回一个包含默认翻译的简单对象
    return {
      t: (key) => {
        const defaultTranslations = {
          'common.cancel': 'Cancel',
          'common.confirm': 'Confirm',
          'common.confirmOperation': 'Confirm Operation'
        };
        return defaultTranslations[key] || key;
      }
    };
  }
};

// 创建弹窗实例的函数
const createInstance = (component, props, container) => {
  const app = createApp(component, props);
  const mountElement = document.createElement('div');
  container.appendChild(mountElement);
  
  const instance = app.mount(mountElement);
  
  // 提供销毁方法
  instance.destroy = () => {
    app.unmount();
    container.removeChild(mountElement);
  };
  
  return instance;
};

// 弹窗管理器
const popupManager = {
  // 模态弹窗
  modal(options = {}) {
    const container = document.body;
    let instance = null;
    
    // 处理options
    // 获取i18n实例用于翻译
    const { t } = getI18nInstance();
    
    const props = {
      visible: true,
      title: options.title || '',
      content: options.content || '',
      closable: options.closable !== false,
      maskClosable: options.maskClosable !== false,
      showHeader: options.showHeader !== false,
      showFooter: options.showFooter !== false,
      showCancelButton: options.showCancelButton !== false,
      showConfirmButton: options.showConfirmButton !== false,
      cancelText: options.cancelText || t('common.cancel'),
      confirmText: options.confirmText || t('common.confirm'),
      confirmLoading: options.confirmLoading || false,
      size: options.size || 'medium',
      position: options.position || 'center',
      ...options.props
    };
    
    // 创建组件实例
    const CustomModal = {
      name: 'CustomModal',
      components: { Modal },
      data() {
        return {
          ...props
        };
      },
      methods: {
        handleClose() {
          if (options.onClose) options.onClose();
          this.close();
        },
        handleCancel() {
          if (options.onCancel) options.onCancel();
          this.close();
        },
        handleConfirm() {
          if (options.onConfirm) options.onConfirm();
          if (!options.preventCloseOnConfirm) {
            this.close();
          }
        },
        close() {
          this.visible = false;
          if (instance) {
            setTimeout(() => {
              instance.destroy();
              instance = null;
            }, 300);
          }
        }
      },
      template: `
        <Modal
          :visible="visible"
          :title="title"
          :closable="closable"
          :maskClosable="maskClosable"
          :showHeader="showHeader"
          :showFooter="showFooter"
          :showCancelButton="showCancelButton"
          :showConfirmButton="showConfirmButton"
          :cancelText="cancelText"
          :confirmText="confirmText"
          :confirmLoading="confirmLoading"
          :size="size"
          :position="position"
          @close="handleClose"
          @cancel="handleCancel"
          @confirm="handleConfirm"
        >
          <template v-if="$slots.default" v-slot="">
            <slot></slot>
          </template>
          <template v-else>
            <div v-html="content"></div>
          </template>
        </Modal>
      `
    };
    
    instance = createInstance(CustomModal, {}, container);
    
    // 返回控制方法
    return {
      close: instance.close,
      destroy: instance.destroy,
      instance
    };
  },
  
  // 消息提示
  message(options = {}) {
    const container = document.body;
    
    // 处理options
    const props = {
      show: true,
      type: options.type || 'info',
      message: options.message || '',
      duration: options.duration || 3000,
      position: options.position || 'top-right',
      closable: options.closable !== false,
      icon: options.icon || ''
    };
    
    // 创建实例
    const instance = createInstance(MessageToast, props, container);
    
    // 自动关闭处理
    let timer = null;
    if (props.duration > 0) {
      timer = setTimeout(() => {
        instance.destroy();
        if (timer) clearTimeout(timer);
      }, props.duration + 300); // 加上动画时间
    }
    
    // 返回控制方法
    return {
      close: () => {
        instance.$emit('close');
        setTimeout(() => {
          instance.destroy();
        }, 300);
        if (timer) clearTimeout(timer);
      },
      destroy: instance.destroy,
      instance
    };
  },
  
  // 快捷方法
  success(options) {
    return this.message(typeof options === 'string' ? { message: options, type: 'success' } : { ...options, type: 'success' });
  },
  
  error(options) {
    return this.message(typeof options === 'string' ? { message: options, type: 'error' } : { ...options, type: 'error' });
  },
  
  warning(options) {
    return this.message(typeof options === 'string' ? { message: options, type: 'warning' } : { ...options, type: 'warning' });
  },
  
  info(options) {
    return this.message(typeof options === 'string' ? { message: options, type: 'info' } : { ...options, type: 'info' });
  },
  
  // 确认弹窗
  confirm(options = {}) {
    // 获取i18n实例
    const { t } = getI18nInstance();
    
    return new Promise((resolve, reject) => {
      this.modal({
        title: options.title || t('common.confirmOperation'),
        content: options.content || '',
        showCancelButton: true,
        showConfirmButton: true,
        cancelText: options.cancelText || t('common.cancel'),
        confirmText: options.confirmText || t('common.confirm'),
        onConfirm: () => resolve(true),
        onCancel: () => reject(false),
        ...options
      });
    });
  }
};

export default popupManager;