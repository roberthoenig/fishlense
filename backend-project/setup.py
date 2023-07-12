import os
from setuptools import setup, find_packages


def read(fname):
    return open(os.path.join(os.path.dirname(__file__), fname)).read()


setup(
    name="dummy_server",
    version="0.0.1",
    description="Backend for the dummy project of the 2023 VAST challenge.",
    long_description=read("README.md"),
    package_data={
        "": [
            "illegal_ids.json",
            "user_flag_ids.json",
            "MC1_preprocessed.json",
        ]
    },
    data_files=[(
        "data", [
            "data/illegal_ids.json",
            "data/user_flag_ids.json",
            "data/MC1_preprocessed.json",
        ]
    )],
    classifiers=[
        "Intended Audience :: Developers",
        "Natural Language :: English",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.9",
        "Development Status :: 4 - Beta",
    ],
    entry_points={
        "console_scripts": [
            "start-server = dummy_server.router.app:start_server",
        ]
    },
    install_requires=[
        "Flask>=2.0.0",
        "flask-restful>=0.3.9,<0.4",
        "flask-cors>=3.0.10,<3.1",
        "pandas>=1.4.1,<1.5",
        "scikit-learn>=1.0.2,<1.1",
        "networkx",
        "python-louvain",
        "umap-learn",
        "scikit-learn"
    ],
    packages=find_packages(where="src", include=["dummy_server*"]),
    package_dir={"": "src"},
)
