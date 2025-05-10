from setuptools import find_packages, setup

package_name = 'ros2_sleep'

setup(
    name=package_name,
    version='0.0.0',
    packages=find_packages(exclude=['test']),
    data_files=[
        ('share/ament_index/resource_index/packages',
            ['resource/' + package_name]),
        ('share/' + package_name, ['package.xml']),
    ],
    install_requires=['setuptools'],
    zip_safe=True,
    maintainer='Arjo Chakravarty',
    maintainer_email='arjoc@openrobotics.org',
    description='TODO: Package description',
    license='TODO: License declaration',
    tests_require=['pytest'],
    entry_points={
        'console_scripts': [
        ],
        'ros2cli.command': [
            'sleep = ros2_sleep.verb.sleep:SleepCommand',
        ],
        'ros2cli.extension_point': [
            'ros2_sleep.verb = ros2cli.verb:VerbExtension',
        ],
        'ros2_sleep.verb': [
            'sleep = ros2_sleep.verb.sleep:SleepCommand',
        ],
    },
)
