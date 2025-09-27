import React, { useState, useEffect } from 'react';
import Loading from './Loading';
import loadingService from '../services/loadingService';

const GlobalLoading: React.FC = () => {
  const [loadingState, setLoadingState] = useState(loadingService.getLoadingState());

  useEffect(() => {
    // 监听loading状态变更
    const unsubscribe = loadingService.onLoadingChange((state) => {
      setLoadingState(state);
    });

    // 组件卸载时取消监听
    return unsubscribe;
  }, []);

  return (
    <Loading
      visible={loadingState.visible}
      title={loadingState.title}
      mask={loadingState.mask}
    />
  );
};

export default GlobalLoading;