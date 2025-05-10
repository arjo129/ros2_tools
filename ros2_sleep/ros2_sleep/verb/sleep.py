import rclpy
from rclpy.node import Node
from ros2cli.verb import VerbExtension


class SleepTimer(Node):
    def __init__(self, duration_sec):
        super().__init__('ros2_sleep_timer')
        self.done = False
        self.get_logger().info(f"Sleeping for {duration_sec} seconds (sim time if enabled)...")
        self.create_timer(duration_sec, self._on_timeout)

    def _on_timeout(self):
        self.get_logger().info("Sleep complete.")
        self.done = True


class SleepCommand(VerbExtension):
    def add_arguments(self, parser, cli_name):
        parser.add_argument('seconds', type=float, help='Number of seconds to sleep')
        return parser

    def main(self, *, parser, args):
        rclpy.init()
        node = SleepTimer(args.seconds)
        try:
            while rclpy.ok() and not node.done:
                rclpy.spin_once(node, timeout_sec=0.1)
        finally:
            node.destroy_node()
            rclpy.shutdown()
