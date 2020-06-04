/**
 * @文件说明: 定义选中要素扩展节点与线段中心点的函数
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-06-03 16:43:45
 */

import Constants from '../constants';
import { isBooleanTrue } from '../../../../_util/methods-util';

// 创建Vertex节点对象
const createVertex = (context, pid, coordinates, path) => {
  const vertex = context.newFeature({
    geometry: {
      type: Constants.geojsonTypes.POINT,
      coordinates,
    },
  });
  vertex.updateInternalProperty('meta', Constants.meta.VERTEX);
  vertex.updateInternalProperty('active', Constants.activeStates.ACTIVE);
  vertex.updateInternalProperty('pid', pid);
  // 记录节点的路径索引位置
  vertex.updateInternalProperty('path', path);
  return vertex;
};

// 创建MultiVertex节点对象
const createMultiVertex = (context, pid, path = '0') => {
  const vertex = context.newFeature({
    geometry: {
      type: Constants.geojsonTypes.MULTI_POINT,
      coordinates: [],
    },
  });
  vertex.updateInternalProperty('meta', Constants.meta.VERTEX);
  vertex.updateInternalProperty('active', Constants.activeStates.ACTIVE);
  vertex.updateInternalProperty('pid', pid);
  vertex.updateInternalProperty('path', path);
  return vertex;
};

// 生成绘制要素的单一复合节点
export const createSupplementaryMultiPoints = function(context, feature) {
  const { type, coordinates, properties } = feature;
  const featureId = feature && feature.id;
  const supplementaryPoints = [];

  // 根据线段生成节点对象
  const processLine = function(line) {
    // 记录首个节点，排除Polygon的闭合节点
    let firstPointString = '';
    const points = [];
    // 循环线段的坐标创建节点
    line.map((point, idx) => {
      // 判断当前节点坐标是否与首个节点坐标相同，则忽略
      const stringifiedPoint = JSON.stringify(point);
      if (firstPointString !== stringifiedPoint) {
        points.push(point);
      }
      idx === 0 && (firstPointString = stringifiedPoint);
    });
    return points;
  };

  // 判断是否为线要素类型
  if (type === Constants.geojsonTypes.LINE_STRING) {
    const vertex = createMultiVertex(context, featureId);
    vertex.setCoordinates(processLine(coordinates));
    supplementaryPoints.push(vertex);
  } else if (type === Constants.geojsonTypes.POLYGON) {
    // 判定是否为面要素类型
    const vertex = createMultiVertex(context, featureId);
    const points = [];
    coordinates.map(line => {
      // 判定多边形面的所属分类，根据不同特定分类进行节点筛选
      switch (properties['draw:polygon']) {
        // 圆形
        case 'circle': {
          // 添加半径点
          const index = Math.floor(line.length * 0.75);
          const radius = line[index] || line[0];
          radius && points.push(radius);
          break;
        }
        // 椭圆
        case 'ellipse': {
          // 添加长轴半径点
          line[0] && points.push(line[0]);
          const index = Math.floor(line.length * 0.5);
          line[index] && points.push(line[index]);
          break;
        }
        default: {
          points.push(...processLine(line));
          break;
        }
      }
    });
    vertex.updateInternalProperty('polygon', properties['draw:polygon']);
    vertex.setCoordinates(points);
    supplementaryPoints.push(vertex);
  }

  return supplementaryPoints;
};
