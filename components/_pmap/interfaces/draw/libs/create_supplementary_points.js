/**
 * @文件说明: 定义选中要素扩展节点与线段中心点的函数
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-06-03 16:43:45
 */

import Constants from '../constants';

// 创建Vertex节点对象
const createVertex = (context, pid, coordinates, path, selected) => {
  const vertex = context.newFeature({
    geometry: {
      type: Constants.geojsonTypes.POINT,
      coordinates,
    },
  });
  vertex.updateInternalProperty('meta', Constants.meta.VERTEX);
  vertex.updateInternalProperty('active', Constants.activeStates.ACTIVE);
  vertex.updateInternalProperty('pid', pid);
  vertex.updateInternalProperty('path', path);
  vertex.updateInternalProperty('selected', selected);
  return vertex;
};

// 创建MidPoint中点对象
const createMidpoint = (context, pid, startVertex, endVertex) => {
  const iMapApi = context.ctx.api.iMapApi;
  const startCoord = startVertex.coordinates;
  const endCoord = endVertex.coordinates;
  // 计算两点之间的中心点
  const ptStart = iMapApi.project([startCoord[0], startCoord[1]]);
  const ptEnd = iMapApi.project([endCoord[0], endCoord[1]]);
  const midCoordinates = iMapApi.unproject([(ptStart.x + ptEnd.x) / 2, (ptStart.y + ptEnd.y) / 2]).toArray();

  const midpoint = context.newFeature({
    geometry: {
      type: Constants.geojsonTypes.POINT,
      coordinates: midCoordinates,
    },
  });
  midpoint.updateInternalProperty('meta', Constants.meta.MIDPOINT);
  midpoint.updateInternalProperty('active', Constants.activeStates.ACTIVE);
  midpoint.updateInternalProperty('pid', pid);
  midpoint.updateInternalProperty('path', endVertex.properties['draw:path']);
  return midpoint;
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
  const { type, coordinates, features, properties } = feature;
  const featureId = feature && feature.id;
  let supplementaryPoints = [];

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
  } else if (type.indexOf(Constants.geojsonTypes.MULTI_PREFIX) === 0) {
    // 判定是否为复合要素类型
    features.map((subFeature, index) => {
      subFeature.id = featureId;
      supplementaryPoints = supplementaryPoints.concat(createSupplementaryMultiPoints(context, subFeature));
    });
  }

  return supplementaryPoints;
};

// 生成绘制要素的节点
export const createSupplementaryPoints = function(context, feature, options = {}, basePath = null) {
  const { type, coordinates, features, properties } = feature;
  const featureId = feature && feature.id;
  let supplementaryPoints = [];

  // 判定是否为选中的节点路径
  const isSelectedPath = function(pid, path) {
    if (!options.selectedPaths) {
      return false;
    }
    let selected = false;
    for (let i = 0, len = options.selectedPaths.length; i < len; i++) {
      if (options.selectedPaths[i].feature_id === pid && options.selectedPaths[i].coord_path === path) {
        selected = true;
        break;
      }
    }
    return selected;
  };
  // 根据线段生成节点对象
  const processLine = function(line, lineBasePath) {
    // 记录首个节点，排除Polygon的闭合节点
    let firstPointString = '';
    let lastVertex = null;
    // 循环线段的坐标创建节点
    line.map((point, idx) => {
      const pointPath = lineBasePath !== undefined && lineBasePath !== null ? `${lineBasePath}.${idx}` : String(idx);
      const vertex = createVertex(context, featureId, point, pointPath, isSelectedPath(featureId, pointPath));
      properties['draw:polygon'] && vertex.updateInternalProperty('polygon', properties['draw:polygon']);
      // 判定是否需创建中点
      if (options.midpoint && lastVertex) {
        const midpoint = createMidpoint(context, featureId, lastVertex, vertex);
        midpoint && supplementaryPoints.push(midpoint);
      }
      lastVertex = vertex;

      // 判断当前节点坐标是否与首个节点坐标相同，则忽略
      const stringifiedPoint = JSON.stringify(point);
      if (firstPointString !== stringifiedPoint) {
        supplementaryPoints.push(vertex);
      }
      idx === 0 && (firstPointString = stringifiedPoint);
    });
  };

  // 判断是否为线要素类型
  if (type === Constants.geojsonTypes.LINE_STRING) {
    processLine(coordinates, basePath);
  } else if (type === Constants.geojsonTypes.POLYGON) {
    coordinates.map((line, lineIndex) => {
      // 判定多边形面的所属分类，根据不同特定分类进行节点筛选
      switch (properties['draw:polygon']) {
        // 圆形
        case 'circle': {
          // 添加半径点
          const index = Math.floor(line.length * 0.75);
          const radius = line[index] || line[0];
          if (radius) {
            const pointPath = basePath !== null ? `${basePath}.0.${index}` : `0.${index}`;
            const vertex = createVertex(context, featureId, radius, pointPath, isSelectedPath(featureId, pointPath));
            vertex.updateInternalProperty('polygon', properties['draw:polygon']);
            supplementaryPoints.push(vertex);
          }
          break;
        }
        // 椭圆
        case 'ellipse': {
          // 添加长轴半径点
          if (line[0]) {
            const pointPath = basePath !== null ? `${basePath}.0.0` : `0.0`;
            const vertex = createVertex(context, featureId, line[0], pointPath, isSelectedPath(featureId, pointPath));
            vertex.updateInternalProperty('polygon', properties['draw:polygon']);
            supplementaryPoints.push(vertex);
          }
          const index = Math.floor(line.length * 0.5);
          if (line[index]) {
            const pointPath = basePath !== null ? `${basePath}.0.${index}` : `0.${index}`;
            const vertex = createVertex(context, featureId, line[index], pointPath, isSelectedPath(featureId, pointPath));
            vertex.updateInternalProperty('polygon', properties['draw:polygon']);
            supplementaryPoints.push(vertex);
          }
          break;
        }
        default: {
          processLine([...line, line[0]], basePath !== null ? `${basePath}.${lineIndex}` : String(lineIndex));
          break;
        }
      }
    });
  } else if (type.indexOf(Constants.geojsonTypes.MULTI_PREFIX) === 0) {
    features.map((subFeature, index) => {
      subFeature.id = featureId;
      supplementaryPoints = supplementaryPoints.concat(createSupplementaryPoints(context, subFeature, options, index));
    });
  }

  return supplementaryPoints;
};
