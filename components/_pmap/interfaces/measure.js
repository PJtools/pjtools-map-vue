/**
 * @文件说明: Interfaces.Measure 地图测量对象
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-06-16 14:56:50
 */

import hat from 'hat';
import throttle from 'lodash/throttle';
import find from 'lodash/find';
import omit from 'omit.js';
import { BasicMapApiEvented } from '../util/basicMapApiClass';
import { getPrefixCls } from '../../_util/methods-util';
import Draw from './draw';
import { defaultDrawTheme } from './draw/styles';

class MeasureStore {
  constructor(measure) {
    this.id = hat();
    this.measure = measure;
    this.iMapApi = this.measure.iMapApi;
    // 记录地图的“绘制”交互对象
    this.draw = null;
    // 记录当前绘图的数据
    this.data = {};
  }

  // 添加地图测量的图层
  addMeasureLayers() {
    // 添加Line线段图层
    if (!this._lineLayer) {
      this._lineLayer = this.iMapApi.Layers.addLineLayer(
        `measure_line_${this.id}`,
        {
          paint: {
            'line-color': defaultDrawTheme.active['line-color'],
            'line-width': defaultDrawTheme.active['line-width'],
          },
        },
        {
          layerGroupId: `measure_layers_${this.id}`,
        },
      );
    }
    // 添加Polygon面图层
    if (!this._polygonLayer) {
      this._polygonLayer = this.iMapApi.Layers.addPolygonLayer(
        `measure_polygon_${this.id}`,
        {
          paint: {
            'fill-color': defaultDrawTheme.active['polygon-color'],
            'line-color': defaultDrawTheme.active['polygon-outline-color'],
            'line-width': defaultDrawTheme.active['polygon-outline-width'],
          },
        },
        {
          layerGroupId: `measure_layers_${this.id}`,
          outline: true,
        },
      );
    }
    // 添加Point点图层
    if (!this._pointLayer) {
      this._pointLayer = this.iMapApi.Layers.addCirclePointLayer(
        `measure_point_${this.id}`,
        {
          paint: {
            'circle-color': defaultDrawTheme.active['vertex-color'],
            'circle-radius': defaultDrawTheme.active['vertex-radius'],
            'circle-stroke-color': defaultDrawTheme.active['vertex-outline-color'],
            'circle-stroke-width': defaultDrawTheme.active['vertex-outline-width'],
          },
        },
        {
          layerGroupId: `measure_layers_${this.id}`,
        },
      );
    }
  }

  // 移除地图测量的图层
  removeMeasureLayers() {
    // 移除Point点图层
    if (this._pointLayer) {
      this._pointLayer.remove();
      delete this._pointLayer;
    }
    // 移除Line线图层
    if (this._lineLayer) {
      this._lineLayer.remove();
      delete this._lineLayer;
    }
    // 移除Polygon面图层
    if (this._polygonLayer) {
      this._polygonLayer.remove();
      delete this._polygonLayer;
    }
  }

  // 判断是否渲染地图测量图层
  isLoadMeasureLayers() {
    return !!(this._pointLayer && this._lineLayer && this._polygonLayer);
  }

  // 添加地图测量图层的Feature数据
  addLayerToFeatures(data) {
    if (!data || !data.mode) {
      return;
    }

    // 添加Vertex节点
    this._pointLayer && this._pointLayer.addFeatures(data.vertexs);
    // 判断是否为“Line”线段测量模式
    if (data.mode === 'line') {
      // 添加Line线段的节点
      this._lineLayer && this._lineLayer.addFeatures(data.feature);
    } else {
      this._polygonLayer && this._polygonLayer.addFeatures(data.feature);
    }
  }

  // 渲染测量的Icon图标DOM结构
  renderMeasureIcon() {
    const element = document.createElement('i');
    element.innerHTML = `
      <svg viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false">
        <path d="M927.0784 583.3216l-506.88-506.8288a102.9632 102.9632 0 0 0-144.0768 0l-179.2 179.2a100.8128 100.8128 0 0 0 0 144.0768l455.3216 455.3216H148.48c-25.6 0-46.08 25.6-46.08 51.2s20.48 51.2 46.08 51.2h727.04c25.6 0 46.08-25.6 46.08-51.2s-20.48-51.2-40.96-51.2h-81.2032l127.6928-127.6928a100.864 100.864 0 0 0-0.0512-144.0768z m-251.2896 250.4704L169.3184 328.0384l178.4832-179.2 72.6528 72.5504c-1.8944 1.4336-3.9936 2.1504-5.7344 3.8912L358.4 281.6c-20.48 20.48-20.48 51.2 0 71.68 20.48 20.48 51.2 20.48 71.68 0l56.32-56.32c1.7408-1.7408 2.4576-3.8912 3.9424-5.7856l76.6464 76.544c-3.0208 1.9968-6.1952 3.328-8.9088 6.0416L465.92 465.92c-20.48 20.48-20.48 51.2 0 71.68 20.48 20.48 51.2 20.48 71.68 0l92.16-92.16c2.7136-2.7136 4.096-5.9392 6.0928-8.96l74.5984 74.496c-3.0208 1.9968-6.2976 3.4304-9.0112 6.144l-56.32 56.32c-20.48 20.48-20.48 51.2 0 71.68 20.48 20.48 51.2 20.48 71.68 0l56.32-56.32c2.7648-2.7648 4.1472-6.0416 6.1952-9.1136l75.4176 75.3152-178.944 178.7904z"></path>
      </svg>
    `;
    return element;
  }

  // 渲染“删除”的Icon图标DOM结构
  renderDeleteIcon() {
    const element = document.createElement('i');
    element.innerHTML = `
      <svg viewBox="64 64 896 896" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false">
        <path d="M360 184h-8c4.4 0 8-3.6 8-8v8h304v-8c0 4.4 3.6 8 8 8h-8v72h72v-80c0-35.3-28.7-64-64-64H352c-35.3 0-64 28.7-64 64v80h72v-72zm504 72H160c-17.7 0-32 14.3-32 32v32c0 4.4 3.6 8 8 8h60.4l24.7 523c1.6 34.1 29.8 61 63.9 61h454c34.2 0 62.3-26.8 63.9-61l24.7-523H888c4.4 0 8-3.6 8-8v-32c0-17.7-14.3-32-32-32zM731.3 840H292.7l-24.2-512h487l-24.2 512z"></path>
      </svg>
    `;
    return element;
  }

  // 激活当前地图绘图模式
  activeDrawMode(mode) {
    // 销毁已存在的绘图对象
    this.draw && this.destroyDraw();
    // 实例化地图绘图模式
    this.draw = new Draw(this.iMapApi);
    // 激活绘图模式
    this.draw.enable(mode, {
      cursor: {
        icon: this.renderMeasureIcon(),
        content: `单击确定${mode === 'circle' ? '圆心' : '起点'}，ESC键取消`,
      },
    });
    // 绑定绘图模式的事件监听
    this.draw.on('draw.click', this.handleDrawClick.bind(this));
    this.draw.on('draw.mousemove', throttle(this.handleDrawMouseMove, 30).bind(this));
    this.draw.on('draw.complete', this.handleDrawCompleted.bind(this));
    this.draw.on('draw.cancel', this.handleDrawCancel.bind(this));
    // 记录当前测量的Id对象
    this.data[this.draw.uid] = {
      complete: false,
      mode: this.draw.getMode(),
      vertexs: this.iMapApi.createMultiPointFeature(hat(), [], { pid: this.draw.uid }),
      feature: null,
      markers: [],
      measure: null,
    };
  }

  // 销毁当前地图的绘图实例
  destroyDraw() {
    if (this.draw) {
      // 判断是否当前绘制测量是否为完成，则清除
      const id = this.draw.uid;
      if (this.data[id] && !this.data[id].complete) {
        this.removeMeasureData(id);
      }
      // 注销当前绘图对象
      this.draw.destroy();
      this.draw = null;
    }
  }

  // 执行绘图的单击Click事件
  handleDrawClick(params) {
    const { e, measure } = params;
    const coordinates = e.lngLat.toArray();
    const data = this.data[this.draw.uid];
    // 添加Vertex节点坐标
    data.vertexs.geometry.coordinates.push(coordinates);
    // 判断是否为“Line”线段测量模式
    if (data.mode === 'line') {
      // 添加距离测量的Vertex节点信息
      let content = '起点';
      if (measure) {
        content = `<span><label>${measure.line.round}</label>${measure.line.unitCN}</span>`;
        data.measure.push({ value: measure.line.round, unit: measure.line.unit });
      } else {
        data.measure = [{ value: 0, unit: 'm' }];
      }
      data.markers.push(this.addMeasureMarker(coordinates, content, { pid: this.draw.uid }));
    } else if (data.mode === 'polygon') {
      if (data.vertexs.geometry.coordinates.length < 2) {
        this.iMapApi.Handlers.cursor.updateContent('再次单击确定节点，ESC键取消');
      }
    }
  }

  // 执行绘图的MouseMove事件
  handleDrawMouseMove(params) {
    if (!this.draw) {
      return;
    }
    const data = this.data[this.draw.uid];
    const { measure } = params;
    if (data && data.mode) {
      let content = null;
      switch (data.mode) {
        case 'line': {
          content = `总长：${measure.line.round}${measure.line.unitCN}，双击结束`;
          break;
        }
        case 'polygon': {
          if (data.vertexs.geometry.coordinates.length >= 2) {
            content = `面积：${measure.polygon.round}${measure.polygon.unitCN}，双击结束`;
          }
          break;
        }
        case 'rectangle': {
          content = `面积：${measure.polygon.round}${measure.polygon.unitCN}，单击结束`;
          break;
        }
        case 'circle': {
          content = `半径：${measure.circle.round}${measure.circle.unitCN}，单击结束`;
          break;
        }
      }
      if (content) {
        requestAnimationFrame(() => {
          const cursor = this.iMapApi.Handlers.cursor;
          cursor.updateContent(content);
        });
      }
    }
  }

  // 执行绘图的完成Complete事件
  handleDrawCompleted(params) {
    const data = this.data[this.draw.uid];
    const { measure, feature } = params;
    if (data && data.mode) {
      switch (data.mode) {
        // “Line”线段距离测量
        case 'line': {
          // 移除最后添加的节点Marker信息
          const lastIndex = data.markers.length - 1;
          const lastMarker = data.markers[lastIndex];
          lastMarker.remove();
          // 重构最后节点Marker信息
          const coordinates = lastMarker.getLngLat().toArray();
          const content = `<span>总长:<label>${measure.line.round}</label>${measure.line.unitCN}</span>`;
          const marker = this.addMeasureMarker(coordinates, content, { pid: this.draw.uid }, true);
          // 替换最后节点的Marker对象
          data.markers.splice(lastIndex, 1, marker);
          break;
        }
        // “Polygon”多边形面积测量
        case 'polygon': {
          // 添加最后节点Marker信息
          let coordinates = data.vertexs.geometry.coordinates[1];
          const first = data.vertexs.geometry.coordinates[0];
          const next = data.vertexs.geometry.coordinates[2];
          const last = data.vertexs.geometry.coordinates[data.vertexs.geometry.coordinates.length - 1];
          coordinates[0] < next[0] && (coordinates = first[0] < last[0] ? last : first);
          const content = `
            <span>周长:<label>${measure.perimeter.round}</label>${measure.perimeter.unitCN}</span>
            <span>面积:<label>${measure.polygon.round}</label>${measure.polygon.unitCN}</span>
          `;
          const marker = this.addMeasureMarker(coordinates, content, { pid: this.draw.uid }, true);
          data.markers.push(marker);
          data.measure = {
            area: { value: measure.polygon.round, unit: measure.polygon.unit },
            perimeter: { value: measure.perimeter.round, unit: measure.perimeter.unit },
          };
          break;
        }
        // “Rectangle”矩形面积测量
        case 'rectangle': {
          // 更新Vertex节点
          data.vertexs.geometry.coordinates = feature.geometry.coordinates[0];
          // 添加最后节点Marker信息
          let coordinates = data.vertexs.geometry.coordinates[1];
          const first = data.vertexs.geometry.coordinates[0];
          coordinates[0] < first[0] && (coordinates = first);
          const content = `
            <span>长:<label>${measure.length.round}</label>${measure.length.unitCN}</span>
            <span>宽:<label>${measure.width.round}</label>${measure.width.unitCN}</span>
            <span>面积:<label>${measure.polygon.round}</label>${measure.polygon.unitCN}</span>
          `;
          const marker = this.addMeasureMarker(coordinates, content, { pid: this.draw.uid }, true);
          data.markers.push(marker);
          data.measure = {
            area: { value: measure.polygon.round, unit: measure.polygon.unit },
            length: { value: measure.length.round, unit: measure.length.unit },
            width: { value: measure.width.round, unit: measure.width.unit },
          };
          break;
        }
        // “Circle”圆形面积测量
        case 'circle': {
          // 更新Vertex节点
          const index = Math.floor(feature.geometry.coordinates[0].length * 0.75);
          data.vertexs.geometry.coordinates = [feature.geometry.coordinates[0][index]];
          // 添加最后节点Marker信息
          const coordinates = data.vertexs.geometry.coordinates[0];
          const content = `
            <span>半径:<label>${measure.circle.round}</label>${measure.circle.unitCN}</span>
            <span>周长:<label>${measure.perimeter.round}</label>${measure.perimeter.unitCN}</span>
            <span>面积:<label>${measure.polygon.round}</label>${measure.polygon.unitCN}</span>
          `;
          const marker = this.addMeasureMarker(coordinates, content, { pid: this.draw.uid }, true);
          data.markers.push(marker);
          data.measure = {
            area: { value: measure.polygon.round, unit: measure.polygon.unit },
            perimeter: { value: measure.perimeter.round, unit: measure.perimeter.unit },
            radius: { value: measure.circle.round, unit: measure.circle.unit },
          };
          break;
        }
      }
      data.feature = { ...feature };
      data.feature.id = this.draw.uid;
      data.complete = true;
      // 添加测量图层的数据
      this.addLayerToFeatures(data);
      // 清除当前测量的绘图对象
      this.destroyDraw();
      // 触发地图测量的回调事件
      this.measure.fire('complete', { data: { ...omit(data, ['vertexs', 'complete']), id: data.feature.id } });
    }
  }

  // 执行绘图的取消Cancel事件
  handleDrawCancel() {
    // 移除当前已绘制的数据
    this.removeMeasureData(this.draw.uid);
    // 清除当前测量的绘图对象
    this.draw.destroy();
    this.draw = null;
    // 触发地图测量的回调事件
    this.measure.fire('cancel');
  }

  // 添加地图测量的Marker量算
  addMeasureMarker(coordinates, content, options = {}, isDelete = false) {
    const map = this.iMapApi.map;
    const { mapboxgl } = this.iMapApi.exports;
    const prefixCls = getPrefixCls('map');

    const element = document.createElement('div');
    element.className = `${prefixCls}-measure`;
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'measure-content';
    contentWrapper.innerHTML = content;
    element.appendChild(contentWrapper);
    // 判断是否添加删除按钮结构
    if (isDelete) {
      const closeWrapper = document.createElement('div');
      closeWrapper.className = 'measure-close';
      closeWrapper.appendChild(this.renderDeleteIcon());
      element.appendChild(closeWrapper);
      options.pid && closeWrapper.addEventListener('click', this.removeMeasureData.bind(this, options.pid), false);
    }

    // 创建Marker标注对象
    const marker = new mapboxgl.Marker({
      element,
      anchor: options.anchor || 'left',
      offset: options.offset || [8, 0],
    });
    options.pid && (marker.pid = options.pid);
    marker.setLngLat(coordinates).addTo(map);
    return marker;
  }

  // 删除指定Id的测量数据
  removeMeasureData(id) {
    const data = this.data[id];
    if (data) {
      // 删除指定Id测量数据的Marker节点
      if (data.markers && data.markers.length) {
        for (let i = data.markers.length - 1; i >= 0; i--) {
          data.markers[i].remove();
          data.markers.splice(i, 1);
        }
      }
      // 移除指定Id测量的图层Feature要素
      this._pointLayer && this._pointLayer.removeFeatureByProperty('pid', id);
      this._lineLayer && this._lineLayer.removeFeatureById(id);
      this._polygonLayer && this._polygonLayer.removeFeatureById(id);
      // 移除缓存对象
      delete this.data[id];
    }
  }
}

const _store = Symbol('Store');

class Measure extends BasicMapApiEvented {
  // 构造函数
  constructor(iMapApi) {
    super(iMapApi);

    // 禁用/启用状态
    this._enabled = false;
    // 地图测量的内部Store对象
    this[_store] = new MeasureStore(this);
    // 初始化添加地图测量图层
    this[_store].addMeasureLayers();
  }

  /**
   * 激活测量模式
   */
  enable(mode = 'line') {
    // 判断测量的模式是否不属于指定内置模式，则采用默认模式
    if (!mode || ['line', 'polygon', 'circle', 'rectangle'].indexOf(mode) === -1) {
      mode = 'line';
    }
    // 判断是否未渲染地图测量图层，则进行渲染添加
    const store = this[_store];
    !store.isLoadMeasureLayers() && store.addMeasureLayers();
    // 激活当前绘图模式
    store.activeDrawMode(mode);
    // 更新状态
    this._enabled = true;
  }

  /**
   * 取消激活测量
   */
  disable() {
    if (!this.isEnabled()) {
      return;
    }
    // 销毁当前绘图模式
    const store = this[_store];
    store.destroyDraw();
    // 更新状态
    this._enabled = false;
  }

  /**
   * 获取当前禁用/启用状态
   */
  isEnabled() {
    return !!this._enabled;
  }

  /**
   * 获取当前活动状态
   */
  isActive() {
    const store = this[_store];
    return (store && store.draw && store.draw.isActive()) || false;
  }

  /**
   * 销毁测量的绘制图层与数据
   */
  destroy() {
    if (!this.isEnabled()) {
      return;
    }
    const store = this[_store];
    // 取消当前绘制的测量
    store.destroyDraw();
    // 移除地图测量的节点Marker数据
    if (store.data) {
      const keys = Object.keys(store.data);
      keys.map(key => {
        store.removeMeasureData(key);
      });
    }
    // 移除地图测量的图层数据
    store.removeMeasureLayers();
    // 更新状态
    this._enabled = false;
  }

  /**
   * 获取当前已绘制的所有地图测量数据
   */
  getAllData() {
    const store = this[_store];
    if (store && store.data) {
      const keys = Object.keys(store.data);
      if (keys && keys.length) {
        const data = [];
        keys.map(key => {
          if (store.data[key].complete) {
            data.push({
              id: key,
              feature: store.data[key].feature,
              markers: store.data[key].markers,
              measure: store.data[key].measure,
              mode: store.data[key].mode,
            });
          }
        });
        return data;
      }
    }
    return [];
  }

  /**
   * 获取指定Id的地图测量数据
   * @param {String} id 测量数据的唯一Id
   */
  getDataById(id) {
    const data = this.getAllData();
    if (data && data.length) {
      return find(data, { id });
    }
    return null;
  }

  /**
   * 删除指定Id的地图测量数据
   * @param {String} id 测量数据的唯一Id
   */
  deleteById(id) {
    const store = this[_store];
    store && store.removeMeasureData(id);
  }
}

export default Measure;
