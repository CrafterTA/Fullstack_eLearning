import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, Upload, message, Tabs } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axiosInstance from "../../config/axios";
import { Lesson, Video, Material } from "../../types/types";

const { TextArea } = Input;
const { TabPane } = Tabs;

interface AdLessonsProps {
  courseId: number;
  onBack: () => void;
}

const AdLessons: React.FC<AdLessonsProps> = ({ courseId, onBack }) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedTab, setSelectedTab] = useState<"lessons" | "videos" | "materials">("lessons");
  const [loading, setLoading] = useState(false);
  const [isLessonModalVisible, setIsLessonModalVisible] = useState(false);
  const [isVideoModalVisible, setIsVideoModalVisible] = useState(false);
  const [isMaterialModalVisible, setIsMaterialModalVisible] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [lessonForm] = Form.useForm();
  const [videoForm] = Form.useForm();
  const [materialForm] = Form.useForm();

  const fetchLessons = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/courses/${courseId}/lessons`);
      setLessons(response.data);
    } catch (error) {
      message.error("Failed to fetch lessons");
      console.error("Error fetching lessons:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVideos = async (lessonId: number) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/lessons/${lessonId}`);
      setVideos(response.data.videos || []);
    } catch (error) {
      message.error("Failed to fetch videos");
      console.error("Error fetching videos:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMaterials = async (lessonId: number) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/lessons/${lessonId}`);
      setMaterials(response.data.materials || []);
    } catch (error) {
      message.error("Failed to fetch materials");
      console.error("Error fetching materials:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, [courseId]);

  useEffect(() => {
    if (selectedLesson && selectedTab === "videos") fetchVideos(selectedLesson.id);
    if (selectedLesson && selectedTab === "materials") fetchMaterials(selectedLesson.id);
  }, [selectedLesson, selectedTab]);

  const handleCreateOrUpdateLesson = async (values: any) => {
    try {
      const lessonData = {
        title: values.title,
        description: values.description,
        order_number: values.order_number || 0,
      };
      if (editingLesson) {
        await axiosInstance.put(`/lessons/${editingLesson.id}`, lessonData);
        message.success("Lesson updated successfully");
      } else {
        await axiosInstance.post(`/courses/${courseId}/lessons`, lessonData);
        message.success("Lesson created successfully");
      }
      setIsLessonModalVisible(false);
      lessonForm.resetFields();
      setEditingLesson(null);
      fetchLessons();
    } catch (error) {
      message.error("Failed to save lesson");
      console.error("Error saving lesson:", error);
    }
  };

  const handleCreateOrUpdateVideo = async (values: any) => {
    try {
      const formData = new FormData();
      formData.append("title", values.title);
      if (values.description) formData.append("description", values.description);
      if (values.video) formData.append("video", values.video.file);
      formData.append("order_number", values.order_number?.toString() || "0");
      if (values.duration) formData.append("duration", values.duration.toString());
      formData.append("is_preview", values.is_preview ? "true" : "false");

      if (editingVideo) {
        await axiosInstance.put(`/videos/${editingVideo.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        message.success("Video updated successfully");
      } else if (selectedLesson) {
        await axiosInstance.post(`/lessons/${selectedLesson.id}/videos`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        message.success("Video added successfully");
      }
      setIsVideoModalVisible(false);
      videoForm.resetFields();
      setEditingVideo(null);
      if (selectedLesson) fetchVideos(selectedLesson.id);
    } catch (error) {
      message.error("Failed to save video");
      console.error("Error saving video:", error);
    }
  };

  const handleCreateOrUpdateMaterial = async (values: any) => {
    try {
      const formData = new FormData();
      formData.append("title", values.title);
      if (values.material) formData.append("material", values.material.file);
      if (values.file_type) formData.append("file_type", values.file_type);

      if (editingMaterial) {
        await axiosInstance.put(`/materials/${editingMaterial.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        message.success("Material updated successfully");
      } else if (selectedLesson) {
        await axiosInstance.post(`/lessons/${selectedLesson.id}/materials`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        message.success("Material added successfully");
      }
      setIsMaterialModalVisible(false);
      materialForm.resetFields();
      setEditingMaterial(null);
      if (selectedLesson) fetchMaterials(selectedLesson.id);
    } catch (error) {
      message.error("Failed to save material");
      console.error("Error saving material:", error);
    }
  };

  const handleDeleteVideo = async (videoId: number) => {
    try {
      await axiosInstance.delete(`/videos/${videoId}`);
      message.success("Video deleted successfully");
      if (selectedLesson) fetchVideos(selectedLesson.id);
    } catch (error) {
      message.error("Failed to delete video");
      console.error("Error deleting video:", error);
    }
  };

  const handleDeleteLesson = async (lessonId: number) => {
    try {
      await axiosInstance.delete(`/lessons/${lessonId}`);
      message.success("Lesson deleted successfully");
      fetchLessons();
      // If the deleted lesson was selected, clear selection and tabs
      if (selectedLesson && selectedLesson.id === lessonId) {
        setSelectedLesson(null);
        setSelectedTab("lessons");
      }
    } catch (error) {
      message.error("Failed to delete lesson");
      console.error("Error deleting lesson:", error);
    }
  };

  const handleDeleteMaterial = async (materialId: number) => {
    try {
      await axiosInstance.delete(`/materials/${materialId}`);
      message.success("Material deleted successfully");
      if (selectedLesson) fetchMaterials(selectedLesson.id);
    } catch (error) {
      message.error("Failed to delete material");
      console.error("Error deleting material:", error);
    }
  };

  const showLessonModal = (lesson?: Lesson) => {
    setEditingLesson(lesson || null);
    lessonForm.setFieldsValue(lesson || {});
    setIsLessonModalVisible(true);
  };

  const showVideoModal = (video?: Video) => {
    setEditingVideo(video || null);
    videoForm.setFieldsValue({
      ...video,
      video: video ? { file: null, name: video.video_url || "No file" } : null,
    });
    setIsVideoModalVisible(true);
  };

  const showMaterialModal = (material?: Material) => {
    setEditingMaterial(material || null);
    materialForm.setFieldsValue({
      ...material,
      material: material ? { file: null, name: material.file_url || "No file" } : null,
    });
    setIsMaterialModalVisible(true);
  };

  const handleCancel = (type: "lesson" | "video" | "material") => {
    if (type === "lesson") {
      setIsLessonModalVisible(false);
      lessonForm.resetFields();
      setEditingLesson(null);
    } else if (type === "video") {
      setIsVideoModalVisible(false);
      videoForm.resetFields();
      setEditingVideo(null);
    } else {
      setIsMaterialModalVisible(false);
      materialForm.resetFields();
      setEditingMaterial(null);
    }
  };

  const handleTabChange = (key: string) => {
    setSelectedTab(key as "lessons" | "videos" | "materials");
    if (key === "videos" || key === "materials") {
      if (!selectedLesson) {
        message.warning("Please select a lesson first");
        setSelectedTab("lessons");
      }
    }
  };

  const lessonColumns = [
    { title: "STT", dataIndex: "stt", key: "stt", render: (text: any, record: Lesson, index: number) => index + 1 },
    { title: "Title", dataIndex: "title", key: "title" },
    { title: "Description", dataIndex: "description", key: "description" },
    { title: "Order", dataIndex: "order_number", key: "order_number" },
    { title: "Video Count", dataIndex: "video_count", key: "video_count" },
    { title: "Material Count", dataIndex: "material_count", key: "material_count" },
    {
      title: "Actions",
      key: "actions",
      render: (text: any, record: Lesson) => (
        <div>
          <Button onClick={() => showLessonModal(record)} style={{ marginRight: 8 }}>
            Edit
          </Button>
          <Button onClick={() => handleDeleteLesson(record.id)} danger style={{ marginRight: 8 }}>
            Delete
          </Button>
          <Button onClick={() => { setSelectedLesson(record); setSelectedTab("videos"); }} style={{ marginRight: 8 }}>
            Manage Videos
          </Button>
          <Button onClick={() => { setSelectedLesson(record); setSelectedTab("materials"); }}>
            Manage Materials
          </Button>
        </div>
      ),
    },
  ];

  const videoColumns = [
    { title: "Title", dataIndex: "title", key: "title" },
    { title: "Description", dataIndex: "description", key: "description" },
    { title: "Order", dataIndex: "order_number", key: "order_number" },
    { title: "Duration", dataIndex: "duration", key: "duration" },
    { title: "Preview", dataIndex: "is_preview", key: "is_preview", render: (is_preview: boolean) => (is_preview ? "Yes" : "No") },
    {
      title: "Actions",
      key: "actions",
      render: (text: any, video: Video) => (
        <div>
          <Button onClick={() => showVideoModal(video)} style={{ marginRight: 8 }}>
            Edit
          </Button>
          <Button onClick={() => handleDeleteVideo(video.id)} danger>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const materialColumns = [
    { title: "Title", dataIndex: "title", key: "title" },
    { title: "File Type", dataIndex: "file_type", key: "file_type" },
    {
      title: "Actions",
      key: "actions",
      render: (text: any, material: Material) => (
        <div>
          <Button onClick={() => showMaterialModal(material)} style={{ marginRight: 8 }}>
            Edit
          </Button>
          <Button onClick={() => handleDeleteMaterial(material.id)} danger>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Button type="primary" onClick={onBack} style={{ marginBottom: 16, marginRight: 8 }}>
        Back to Courses
      </Button>
      <Button type="primary" onClick={() => showLessonModal()} style={{ marginBottom: 16 }}>
        Add Lesson
      </Button>
      <Tabs activeKey={selectedTab} onChange={handleTabChange} style={{ marginBottom: 16 }}>
        <TabPane tab="Lessons" key="lessons">
          <Table
            columns={lessonColumns}
            dataSource={lessons}
            loading={loading}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </TabPane>
        <TabPane tab="Videos" key="videos" disabled={!selectedLesson}>
          <Button type="primary" onClick={() => showVideoModal()} style={{ marginBottom: 16 }}>
            Add Video
          </Button>
          <Table
            columns={videoColumns}
            dataSource={videos}
            loading={loading}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </TabPane>
        <TabPane tab="Materials" key="materials" disabled={!selectedLesson}>
          <Button type="primary" onClick={() => showMaterialModal()} style={{ marginBottom: 16 }}>
            Add Material
          </Button>
          <Table
            columns={materialColumns}
            dataSource={materials}
            loading={loading}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </TabPane>
      </Tabs>
      {/* Lesson Modal */}
      <Modal
        title={editingLesson ? "Edit Lesson" : "Add Lesson"}
        open={isLessonModalVisible}
        onOk={() => lessonForm.submit()}
        onCancel={() => handleCancel("lesson")}
      >
        <Form form={lessonForm} onFinish={handleCreateOrUpdateLesson} layout="vertical">
          <Form.Item name="title" label="Title" rules={[{ required: true, message: "Please input title!" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <TextArea />
          </Form.Item>
          <Form.Item name="order_number" label="Order Number">
            <Input type="number" />
          </Form.Item>
        </Form>
      </Modal>
      {/* Video Modal */}
      <Modal
        title={editingVideo ? "Edit Video" : "Add Video"}
        open={isVideoModalVisible}
        onOk={() => videoForm.submit()}
        onCancel={() => handleCancel("video")}
      >
        <Form form={videoForm} onFinish={handleCreateOrUpdateVideo} layout="vertical">
          <Form.Item name="title" label="Title" rules={[{ required: true, message: "Please input title!" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <TextArea />
          </Form.Item>
          <Form.Item name="video" label="Video File" rules={[{ required: !editingVideo, message: "Please upload a video!" }]}>
            <Upload
              beforeUpload={() => false}
              maxCount={1}
              accept="video/*"
            >
              <Button icon={<UploadOutlined />}>Select Video</Button>
            </Upload>
          </Form.Item>
          <Form.Item name="order_number" label="Order Number">
            <Input type="number" />
          </Form.Item>
          <Form.Item name="duration" label="Duration (seconds)">
            <Input type="number" />
          </Form.Item>
          <Form.Item name="is_preview" label="Is Preview" valuePropName="checked">
            <Input type="checkbox" />
          </Form.Item>
        </Form>
      </Modal>
      {/* Material Modal */}
      <Modal
        title={editingMaterial ? "Edit Material" : "Add Material"}
        open={isMaterialModalVisible}
        onOk={() => materialForm.submit()}
        onCancel={() => handleCancel("material")}
      >
        <Form form={materialForm} onFinish={handleCreateOrUpdateMaterial} layout="vertical">
          <Form.Item name="title" label="Title" rules={[{ required: true, message: "Please input title!" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="material" label="Material File" rules={[{ required: !editingMaterial, message: "Please upload a file!" }]}>
            <Upload
              beforeUpload={() => false}
              maxCount={1}
              accept="*/*"
            >
              <Button icon={<UploadOutlined />}>Select File</Button>
            </Upload>
          </Form.Item>
          <Form.Item name="file_type" label="File Type">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdLessons;