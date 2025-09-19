import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ToastAndroid,
} from 'react-native';
import apiService from '../services/api';
import RadioGroup from '../components/RadioGroup';
import Radio from '../components/Radio';
import {goBack} from '../services/navigationService'
interface Project {
  projectId: string;
  groupName: string;
  projectName: string;
}

const ProjectList: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  useEffect(() => {
    projectList();
  }, []);

  
  // 获取项目列表
  const [projectListData, setProjectListData] = useState<Project[]>([]);
  const projectList = async () => {
    try {
      const res = await apiService.getDeviceList();
      console.log('获取项目列表', res.projects);
      if (res.projects.length > 0) {
        console.log('开始设置当前项目为第一个:', res.projects[0]);
        setLoading(false);
        setProjectListData(res.projects);
        // 默认选中第一个项目
        setSelectedProjectId(res.projects[0].projectId);
      } else if (res.projects.length <= 0) {
        console.warn('项目为空');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 处理项目选择变化
  const handleSelectionChange = async (value: string) => {
    setSelectedProjectId(value);
    const selectedItem = projectListData.find(item => item.projectId === value)!;
    console.log('选中项目:', selectedItem);
    try {
      let res = await apiService.switchProject(selectedItem.projectId)
      if (res.ok) {
        console.log('切换项目成功');
        goBack()
      }
    } catch (error) {
      ToastAndroid.show('切换项目失败', ToastAndroid.SHORT);
    }
  };

  return (
    <View style={styles.container}>
      {/* <Text style={styles.header}>选择项目</Text> */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text>加载项目中...</Text>
        </View>
      ) : (
        <RadioGroup
          selectedValue={selectedProjectId}
          onSelectionChange={handleSelectionChange}
          color="#ff600a"
          style={styles.radioGroupContainer}
        >
          {projectListData.map((item) => (
            <View key={item.projectId} style={styles.contentList}>
              <Text style={styles.projectName}>{item.projectName}</Text>
              <Radio value={item.projectId} />
            </View>
          ))}
        </RadioGroup>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    // backgroundColor: '#f5f5f5',
    backgroundColor: '#ffffff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
    textAlign: 'center',
  },
  radioGroupContainer: {
    paddingVertical: 8,
  },
  contentList: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginVertical: 4,
    borderRadius: 8,
    // backgroundColor: '#FFFFFF',
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 1 },
    // shadowOpacity: 0.1,
    // shadowRadius: 2,
    // elevation: 2,
  },
  projectName: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProjectList;
