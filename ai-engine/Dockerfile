FROM python:3.11-slim

WORKDIR /workspace/ai-engine

COPY ai-engine/requirement.txt ./
RUN pip install --no-cache-dir -r requirement.txt

COPY ai-engine/ ./
COPY shared/ ../shared/

EXPOSE 5001

CMD ["python", "app.py"]
