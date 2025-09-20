import React from 'react';
import { Routes, Route } from 'react-router-dom';
import TeacherLayout from '../components/TeacherLayout';
import ClassList from '../components/teacher/ClassList';
import ClassDetail from '../components/teacher/ClassDetail';
import CreateClass from '../components/teacher/CreateClass';

const TeacherDashboard: React.FC = () => {
  return (
    <TeacherLayout>
      <Routes>
        <Route index element={<ClassList />} />
        <Route path="classes" element={<ClassList />} />
        <Route path="classes/new" element={<CreateClass />} />
        <Route path="classes/:id" element={<ClassDetail />} />
      </Routes>
    </TeacherLayout>
  );
};

export default TeacherDashboard;