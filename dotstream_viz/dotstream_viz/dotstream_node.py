import rclpy
from rclpy.node import Node
from std_msgs.msg import String
import pydot
from sensor_msgs.msg import Image
from cv_bridge import CvBridge
import cv2
import numpy as np


class DotstreamNode(Node):
    def __init__(self):
        super().__init__('dotstream_node')
        self.get_logger().info('Dotstream Node has started!')
        self.subscription = self.create_subscription(
            String,
            '/network',
            self.listener_callback,
            10
        )
        self.image_publisher = self.create_publisher(Image, '/graph_image', 10)
        self.bridge = CvBridge()

    def listener_callback(self, msg):

        # Parse DOT data using pydot
        try:
            graphs = pydot.graph_from_dot_data(msg.data)
            if graphs:
                graph = graphs[0]  # Get the first graph
                png_data = graph.create_png()  # Render graph as PNG in memory

                # Convert PNG data to OpenCV image
                np_arr = np.frombuffer(png_data, np.uint8)
                image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

                if image is not None:
                    # Convert the OpenCV image to a ROS2 Image message
                    image_msg = self.bridge.cv2_to_imgmsg(image, encoding="bgr8")
                    self.image_publisher.publish(image_msg)
                    self.get_logger().debug("Published graph image as sensor_msgs/Image")
                else:
                    self.get_logger().error("Failed to decode PNG data into an image")
        except Exception as e:
            self.get_logger().error(f"Failed to render DOT data: {e}")


def main(args=None):
    rclpy.init(args=args)
    node = DotstreamNode()
    rclpy.spin(node)
    rclpy.shutdown()
