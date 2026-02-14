import type { CityStyle, ColorPreset } from '../types';

export const cityColorPresets: ColorPreset[] = [
  // 上海地铁
  { name: '1号线', color: '#EA0B2A', city: 'shmetro' },
  { name: '2号线', color: '#94D40B', city: 'shmetro' },
  { name: '3号线', color: '#F8D000', city: 'shmetro' },
  { name: '4号线', color: '#461D7C', city: 'shmetro' },
  { name: '5号线', color: '#8F59A7', city: 'shmetro' },
  { name: '6号线', color: '#D81672', city: 'shmetro' },
  { name: '7号线', color: '#F58F1A', city: 'shmetro' },
  { name: '8号线', color: '#009EDA', city: 'shmetro' },
  { name: '9号线', color: '#69C9F0', city: 'shmetro' },
  { name: '10号线', color: '#C7A4D6', city: 'shmetro' },
  { name: '11号线', color: '#800000', city: 'shmetro' },
  { name: '12号线', color: '#007A5E', city: 'shmetro' },
  { name: '13号线', color: '#EF90A4', city: 'shmetro' },
  { name: '14号线', color: '#827A04', city: 'shmetro' },
  { name: '15号线', color: '#C8B38E', city: 'shmetro' },
  { name: '16号线', color: '#77C8D0', city: 'shmetro' },
  { name: '17号线', color: '#BC797E', city: 'shmetro' },
  { name: '18号线', color: '#C4984F', city: 'shmetro' },
  { name: '浦江线', color: '#C5C5C5', city: 'shmetro' },
  { name: '磁悬浮', color: '#008B9A', city: 'shmetro' },

  // 北京地铁
  { name: '1号线', color: '#A4343A', city: 'bjmetro' },
  { name: '2号线', color: '#004B87', city: 'bjmetro' },
  { name: '4号线', color: '#008E9C', city: 'bjmetro' },
  { name: '5号线', color: '#AA0061', city: 'bjmetro' },
  { name: '6号线', color: '#D29700', city: 'bjmetro' },
  { name: '7号线', color: '#F5C7C7', city: 'bjmetro' },
  { name: '8号线', color: '#009B77', city: 'bjmetro' },
  { name: '9号线', color: '#97D700', city: 'bjmetro' },
  { name: '10号线', color: '#009BC0', city: 'bjmetro' },
  { name: '13号线', color: '#F9E700', city: 'bjmetro' },
  { name: '14号线', color: '#CA9A8E', city: 'bjmetro' },
  { name: '15号线', color: '#653279', city: 'bjmetro' },
  { name: '16号线', color: '#6BA539', city: 'bjmetro' },
  { name: '17号线', color: '#00A9CE', city: 'bjmetro' },
  { name: '19号线', color: '#D6AEC9', city: 'bjmetro' },
  { name: '八通线', color: '#C63931', city: 'bjmetro' },
  { name: '昌平线', color: '#D070A3', city: 'bjmetro' },
  { name: '亦庄线', color: '#E40077', city: 'bjmetro' },
  { name: '房山线', color: '#E46022', city: 'bjmetro' },
  { name: 'S1线', color: '#A45A2A', city: 'bjmetro' },

  // 广州地铁
  { name: '1号线', color: '#F3D03E', city: 'gzmetro' },
  { name: '2号线', color: '#00629B', city: 'gzmetro' },
  { name: '3号线', color: '#ECA154', city: 'gzmetro' },
  { name: '4号线', color: '#00843D', city: 'gzmetro' },
  { name: '5号线', color: '#C5003E', city: 'gzmetro' },
  { name: '6号线', color: '#80225F', city: 'gzmetro' },
  { name: '7号线', color: '#97D700', city: 'gzmetro' },
  { name: '8号线', color: '#008E9C', city: 'gzmetro' },
  { name: '9号线', color: '#71CC98', city: 'gzmetro' },
  { name: '13号线', color: '#8E8C13', city: 'gzmetro' },
  { name: '14号线', color: '#793D6E', city: 'gzmetro' },
  { name: '18号线', color: '#211747', city: 'gzmetro' },
  { name: '21号线', color: '#211747', city: 'gzmetro' },
  { name: '22号线', color: '#D49A25', city: 'gzmetro' },
  { name: 'APM线', color: '#00B5E2', city: 'gzmetro' },
  { name: '广佛线', color: '#C4D600', city: 'gzmetro' },
];

export const cityStyles: CityStyle[] = [
  {
    id: 'shmetro',
    name: '上海地铁',
    description: '上海地铁风格，圆润的站点设计',
    lineWidth: 8,
    stationSize: 12,
    colors: cityColorPresets.filter(c => c.city === 'shmetro'),
  },
  {
    id: 'bjmetro',
    name: '北京地铁',
    description: '北京地铁风格，简洁的站点设计',
    lineWidth: 6,
    stationSize: 10,
    colors: cityColorPresets.filter(c => c.city === 'bjmetro'),
  },
  {
    id: 'gzmetro',
    name: '广州地铁',
    description: '广州地铁风格，现代化的站点设计',
    lineWidth: 7,
    stationSize: 11,
    colors: cityColorPresets.filter(c => c.city === 'gzmetro'),
  },
  {
    id: 'mtr',
    name: '港铁',
    description: '港铁风格，经典的站点设计',
    lineWidth: 6,
    stationSize: 10,
    colors: [
      { name: '观塘线', color: '#00AF41', city: 'mtr' },
      { name: '荃湾线', color: '#ED1D24', city: 'mtr' },
      { name: '港岛线', color: '#007DC5', city: 'mtr' },
      { name: '东涌线', color: '#F7943E', city: 'mtr' },
      { name: '将军澳线', color: '#7D499D', city: 'mtr' },
      { name: '东铁线', color: '#5EB6E4', city: 'mtr' },
      { name: '屯马线', color: '#923011', city: 'mtr' },
      { name: '迪士尼线', color: '#F173AC', city: 'mtr' },
      { name: '机场快线', color: '#00888A', city: 'mtr' },
    ],
  },
  {
    id: 'tokyo',
    name: '东京地铁',
    description: '东京地铁风格，精致的站点设计',
    lineWidth: 6,
    stationSize: 10,
    colors: [
      { name: '银座线', color: '#FF9500', city: 'tokyo' },
      { name: '丸之内线', color: '#F62E36', city: 'tokyo' },
      { name: '日比谷线', color: '#B5B5B6', city: 'tokyo' },
      { name: '东西线', color: '#00A7DB', city: 'tokyo' },
      { name: '千代田线', color: '#00BB85', city: 'tokyo' },
      { name: '有乐町线', color: '#C1A470', city: 'tokyo' },
      { name: '半藏门线', color: '#9F8F6C', city: 'tokyo' },
      { name: '南北线', color: '#00AC9B', city: 'tokyo' },
      { name: '副都心线', color: '#9C5E31', city: 'tokyo' },
    ],
  },
];

export const getDefaultLineColor = (style: string, index: number): string => {
  const colors = cityColorPresets.filter(c => c.city === style);
  if (colors.length > 0) {
    return colors[index % colors.length].color;
  }
  return '#3B82F6';
};

export const getCityStyle = (styleId: string): CityStyle | undefined => {
  return cityStyles.find(s => s.id === styleId);
};
