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
        parser.description = (
            'Sleep for a given number of seconds using simulation time if available '
            '(falls back to wall time if /clock is not published).'
        )
        parser.add_argument('seconds', type=float, help='Number of seconds to sleep')
        parser.add_argument(
            '--use-sim-time',
            action='store_true',
            help='Enable simulation time (/clock). Falls back to wall time if not set.'
        )
        return parser

    def main(self, *, parser, args):
        rclpy.init()
        
        node = SleepTimer(args.seconds)
        if args.use_sim_time:
            node.get_logger().info('Setting use_sim_time = true')
            node.set_parameters([rclpy.parameter.Parameter('use_sim_time', rclpy.Parameter.Type.BOOL, True)])
        try:
            while rclpy.ok() and not node.done:
                rclpy.spin_once(node, timeout_sec=0.1)
        finally:
            node.destroy_node()
            rclpy.shutdown()
