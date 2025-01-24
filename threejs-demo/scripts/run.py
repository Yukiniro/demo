import numpy as np
import cv2
import open3d as o3d

def depth_to_ply(depth_path, output_path):
    # 读取深度图
    depth = cv2.imread(depth_path, cv2.IMREAD_ANYDEPTH)
    
    # 获取图像尺寸并计算相机内参
    rows, cols = depth.shape
    fx = cols / 2
    fy = rows / 2
    cx = cols / 2
    cy = rows / 2
    
    # 计算顶点数量和面片数量
    vertex_count = rows * cols
    face_count = (rows-1) * (cols-1) * 2  # 每个网格由2个三角形组成
    
    # 创建PLY文件头
    with open(output_path, 'w') as f:
        f.write("ply\n")
        f.write("format ascii 1.0\n")
        f.write("element vertex {}\n".format(vertex_count))
        f.write("property float32 x\n")
        f.write("property float32 y\n") 
        f.write("property float32 z\n")
        f.write("element face {}\n".format(face_count))
        f.write("property list uint8 int32 vertex_indices\n")
        f.write("end_header\n")
        
        # 写入点云数据
        for v in range(rows):
            for u in range(cols):
                z = depth[v, u] / 1000.0
                if z > 0:
                    x = (u - cx) * z / fx
                    y = (v - cy) * z / fy
                    f.write("{:.6f} {:.6f} {:.6f}\n".format(x, y, z))
                    
        # 写入面片数据
        for v in range(rows-1):
            for u in range(cols-1):
                # 每个网格生成两个三角形
                idx0 = v * cols + u
                idx1 = v * cols + (u + 1)
                idx2 = (v + 1) * cols + u
                idx3 = (v + 1) * cols + (u + 1)
                
                # 第一个三角形
                f.write("3 {} {} {}\n".format(idx0, idx2, idx1))
                # 第二个三角形  
                f.write("3 {} {} {}\n".format(idx1, idx2, idx3))

if __name__ == "__main__":
    depth_to_ply("depth.png", "output.ply")
