/**
 * @文件说明: 地图内置组件 - 地图Message消息提示
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-03-13 16:38:03
 */

import { Icon } from 'ant-design-vue';
import Notification from 'ant-design-vue/es/vc-notification';

class Message {
  constructor(id, options = {}) {
    const opts = Object.assign(
      {
        duration: 3,
        top: null,
        getContainer: () => document.body,
        maxCount: 1,
      },
      options,
    );

    this.id = id;
    this.messageInstance = null;
    this.key = 1;
    this.prefixCls = 'pjtools-map-message';
    this.transitionName = 'move-up';
    this.duration = opts.duration;
    this.top = opts.top;
    this.getContainer = opts.getContainer;
    this.maxCount = opts.maxCount;
  }

  open(args) {
    const duration = args.duration !== undefined ? args.duration : this.duration;
    const iconType = {
      info: 'info-circle',
      success: 'check-circle',
      error: 'close-circle',
      warning: 'exclamation-circle',
      loading: 'loading',
    }[args.type];

    const target = `${this.id}_${this.key++}`;
    const closePromise = new Promise(resolve => {
      const callback = () => {
        if (typeof args.onClose === 'function') {
          args.onClose();
        }
        return resolve(true);
      };

      const openMessage = instance => {
        instance.notice({
          key: target,
          duration,
          style: {},
          content: h => (
            <div class={`${this.prefixCls}-custom-content${args.type ? ` ${this.prefixCls}-${args.type}` : ''}`}>
              {args.icon ? (
                typeof args.icon === 'function' ? (
                  args.icon(h)
                ) : (
                  args.icon
                )
              ) : iconType ? (
                <Icon type={iconType} theme={iconType === 'loading' ? 'outlined' : 'filled'} />
              ) : (
                ''
              )}
              <span>{typeof args.content === 'function' ? args.content(h) : args.content}</span>
            </div>
          ),
          onClose: callback,
        });
      };

      if (this.messageInstance) {
        openMessage(this.messageInstance);
      } else {
        Notification.newInstance(
          {
            prefixCls: this.prefixCls,
            transitionName: this.transitionName,
            style: { top: this.top },
            getContainer: this.getContainer,
            maxCount: this.maxCount,
          },
          instance => {
            if (this.messageInstance) {
              openMessage(this.messageInstance);
            } else {
              this.messageInstance = instance;
              openMessage(instance);
            }
          },
        );
      }
    });
    const result = () => {
      if (this.messageInstance) {
        this.messageInstance.removeNotice(target);
      }
    };
    result.then = (filled, rejected) => closePromise.then(filled, rejected);
    result.promise = closePromise;

    return result;
  }

  config(options = {}) {
    if (options.top !== undefined) {
      this.top = options.top;
      this.messageInstance = null;
    }
    if (options.duration !== undefined) {
      this.duration = options.duration;
    }
    if (options.getContainer !== undefined) {
      this.getContainer = options.getContainer;
    }
    if (options.maxCount !== undefined) {
      this.maxCount = options.maxCount;
      this.messageInstance = null;
    }
  }

  success(content, duration, onClose) {
    if (typeof duration === 'function') {
      onClose = duration;
      duration = undefined;
    }
    return this.open({ content, duration, type: 'success', onClose });
  }

  info(content, duration, onClose) {
    if (typeof duration === 'function') {
      onClose = duration;
      duration = undefined;
    }
    return this.open({ content, duration, type: 'info', onClose });
  }

  warning(content, duration, onClose) {
    if (typeof duration === 'function') {
      onClose = duration;
      duration = undefined;
    }
    return this.open({ content, duration, type: 'warning', onClose });
  }

  warn(content, duration, onClose) {
    if (typeof duration === 'function') {
      onClose = duration;
      duration = undefined;
    }
    return this.open({ content, duration, type: 'warning', onClose });
  }

  error(content, duration, onClose) {
    if (typeof duration === 'function') {
      onClose = duration;
      duration = undefined;
    }
    return this.open({ content, duration, type: 'error', onClose });
  }

  loading(content, duration = 0, onClose) {
    if (typeof duration === 'function') {
      onClose = duration;
      duration = 0;
    }
    return this.open({ content, duration, type: 'loading', onClose });
  }

  destroy() {
    if (this.messageInstance) {
      this.messageInstance.destroy();
      this.messageInstance = null;
    }
  }
}

export default Message;
