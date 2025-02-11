'use client';
import { Suspense } from 'react';
import EditPageComponent from '@/components/editComponent';

const LoadingFallback = () => (
    <div className="flex justify-center items-center h-screen">
        <div>Loading...</div>
    </div>
);

const EditPage = () => {
    return (
        <div>
            <Suspense fallback={<LoadingFallback />}>
                <EditPageComponent />
            </Suspense>
        </div>
    );
};

export default EditPage;