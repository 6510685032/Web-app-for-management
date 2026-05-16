# syntax=docker/dockerfile:1
FROM python:3
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
WORKDIR /code

# 1. Install dependencies
COPY requirements.txt /code/
RUN pip install -r requirements.txt

# 2. Copy and permission the entrypoint script at the root level
COPY entrypoint.sh /entrypoint.sh
RUN sed -i 's/\r$//g' /entrypoint.sh  # Safe-guard against Windows CRLF line endings
RUN chmod +x /entrypoint.sh

# 3. Copy the rest of your project files
COPY . /code/

# 4. Point ENTRYPOINT to the exact same root path
ENTRYPOINT ["/entrypoint.sh"]