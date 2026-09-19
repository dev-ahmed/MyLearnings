# MyLearnings

Your backend-engineering learning library — twenty cookbooks (PDF + EPUB),
nineteen interactive study plans (as self-hosted Docker apps), a QR launcher, and
a tunnel tool to reach them from your phone. Framed for a developer fluent in
Node.js/TypeScript moving into Python, PHP/Laravel, Rust, backend infrastructure,
and the full AI/ML-engineering stack — the math foundation, data analysis, data
engineering, machine learning, deep learning, reinforcement learning, RAG, agents,
fine-tuning, MLOps, cloud/Kubernetes, a career track on freelancing, and a technical-terms glossary.

```
MyLearnings/
├── cookbooks/                       # read these (PDF for screen, EPUB for Kindle)
│   ├── languages/
│   │   ├── python/                  Python Backend Cookbook (Django & FastAPI)
│   │   ├── php-laravel/             PHP & Laravel Backend Cookbook
│   │   └── rust/                    Rust for TypeScript Developers
│   ├── infrastructure/
│   │   ├── redis/                   Redis Backend Cookbook
│   │   ├── queues/                  Background Jobs & Queues Cookbook
│   │   ├── mailpit/                 Mailpit Cookbook
│   │   ├── n8n/                     n8n Automation Cookbook
│   │   └── cloud-kubernetes/        Cloud & Kubernetes for ML Cookbook
│   ├── ai-and-ml/
│   │   ├── rag/                     RAG Backend Cookbook
│   │   ├── machine-learning/        Machine Learning Cookbook
│   │   ├── deep-learning/           Deep Learning Cookbook (PyTorch)
│   │   ├── reinforcement-learning/  Reinforcement Learning Cookbook
│   │   ├── ai-agents/               AI Agents Cookbook
│   │   ├── fine-tuning/             Fine-Tuning Cookbook (LoRA/QLoRA/DPO)
│   │   └── mlops/                   MLOps Cookbook
│   ├── data/
│   │   ├── data-analysis/           Applied Data Analysis Cookbook
│   │   └── data-engineering/        Data Engineering Cookbook
│   ├── foundations/
│   │   └── math-for-ml/             Math for Machine Learning Cookbook
│   ├── career/
│   │   └── freelancing/             Freelancing Success Cookbook
│   └── reference/
│       └── technical-terms/         Technical Terms Cookbook (glossary)
├── plans/                           # interactive trackers, each a Docker app
│   ├── python-plan-app/             → http://localhost:8642
│   ├── docker-plan-app/             → http://localhost:8643
│   ├── backend-infra-plan-app/      → http://localhost:8644  (Redis · Queues · Mailpit)
│   ├── laravel-plan-app/            → http://localhost:8645
│   ├── rag-plan-app/                → http://localhost:8646
│   ├── ml-plan-app/                 → http://localhost:8647
│   ├── rust-plan-app/               → http://localhost:8648
│   ├── n8n-plan-app/                → http://localhost:8649  (workflow automation)
│   ├── rl-plan-app/                 → http://localhost:8650  (reinforcement learning)
│   ├── da-plan-app/                 → http://localhost:8651  (data analysis)
│   ├── dl-plan-app/                 → http://localhost:8652  (deep learning)
│   ├── agents-plan-app/             → http://localhost:8653  (AI agents)
│   ├── ft-plan-app/                 → http://localhost:8654  (fine-tuning)
│   ├── mlops-plan-app/              → http://localhost:8655  (MLOps)
│   ├── dataeng-plan-app/            → http://localhost:8656  (data engineering)
│   ├── k8s-plan-app/                → http://localhost:8657  (cloud & Kubernetes)
│   ├── math-plan-app/               → http://localhost:8658  (math for ML)
│   ├── freelancing-plan-app/        → http://localhost:8659  (freelancing success)
│   ├── terms-plan-app/              → http://localhost:8660  (technical terms glossary)
│   └── docker-compose.all.yml       # run ALL plans at once
├── tools/
│   └── tunnel/                      tunnel.sh — reach the plans from your phone
├── start.py  ·  stop.py             one-command start / stop for all plans
├── setup-aliases.py                 add plans-start / plans-stop / plans-qr to ~/.zshrc
├── launcher.py                      open the phone QR launcher (alias: plans-qr)
└── plans-launcher.html             per-plan QR codes to scan from your phone
```

## The library at a glance

| Topic | Cookbook (in `cookbooks/`) | Plan tracker | Port | Length |
| --- | --- | --- | --- | --- |
| Python (Django & FastAPI) | `languages/python/` | Python Backend Sprint | 8642 | 8 wks |
| PHP & Laravel | `languages/php-laravel/` | Laravel Backend Sprint | 8645 | 6 wks |
| Rust (for TS devs) | `languages/rust/` | Rust Sprint | 8648 | 4 wks |
| Docker | *(the plan itself teaches it)* | Docker Deploy Sprint | 8643 | 3 wks |
| Redis | `infrastructure/redis/` | Backend Infra Sprint | 8644 | 3 wks |
| Queues (BullMQ/Celery) | `infrastructure/queues/` | Backend Infra Sprint | 8644 | (wk 2) |
| Mailpit | `infrastructure/mailpit/` | Backend Infra Sprint | 8644 | (wk 3) |
| RAG | `ai-and-ml/rag/` | RAG Sprint | 8646 | 3 wks |
| Machine Learning | `ai-and-ml/machine-learning/` | Machine Learning Sprint | 8647 | 4 wks |
| n8n (workflow automation) | `infrastructure/n8n/` | n8n Automation Sprint | 8649 | 3 wks |
| Math for ML | `foundations/math-for-ml/` | Math for ML Sprint | 8658 | 3 wks |
| Data Analysis | `data/data-analysis/` | Data Analysis Sprint | 8651 | 3 wks |
| Data Engineering | `data/data-engineering/` | Data Engineering Sprint | 8656 | 4 wks |
| Deep Learning (PyTorch) | `ai-and-ml/deep-learning/` | Deep Learning Sprint | 8652 | 4 wks |
| Reinforcement Learning | `ai-and-ml/reinforcement-learning/` | Reinforcement Learning Sprint | 8650 | 4 wks |
| AI Agents (LLM) | `ai-and-ml/ai-agents/` | AI Agents Sprint | 8653 | 3 wks |
| Fine-Tuning (LoRA/DPO) | `ai-and-ml/fine-tuning/` | Fine-Tuning Sprint | 8654 | 3 wks |
| MLOps | `ai-and-ml/mlops/` | MLOps Sprint | 8655 | 4 wks |
| Cloud & Kubernetes | `infrastructure/cloud-kubernetes/` | Cloud & Kubernetes Sprint | 8657 | 4 wks |
| Freelancing (career) | `career/freelancing/` | Freelancing Success Sprint | 8659 | 4 wks |
| Technical Terms (glossary) | `reference/technical-terms/` | Technical Terms Sprint | 8660 | 3 wks |

Redis, Queues, and Mailpit share one combined plan — the **Backend Infra Sprint**
(8644) — because they're learned together as one async-backbone project.

## Reading the cookbooks

Each topic folder holds a **`.pdf`** (best on screen — dark high-contrast code,
tables, diagrams) and a **`.epub`** (best on a Kindle / e-reader — reflowable).
Send an EPUB to your Kindle via *Send to Kindle* (email, the web uploader, or the
phone app).

## Running the plans (Docker)

Each plan is a tiny stateless nginx container serving one HTML page; your
checklist progress lives in your **browser's localStorage**, so redeploys never
lose it.

**Run one plan:**

```bash
cd plans/rust-plan-app
docker compose up -d --build            # → http://localhost:8648
```

**Run them all at once:**

```bash
cd plans
docker compose -f docker-compose.all.yml up -d --build
# Python 8642 · Docker 8643 · Infra 8644 · Laravel 8645 · RAG 8646 · ML 8647 · Rust 8648
# n8n 8649 · RL 8650 · DataAnalysis 8651 · DeepLearning 8652 · AIAgents 8653 · FineTuning 8654
# MLOps 8655 · DataEng 8656 · CloudK8s 8657 · MathForML 8658 · Freelancing 8659 · Terms 8660
```

Stop everything with `docker compose -f docker-compose.all.yml down`.

Each container has a healthcheck, so `docker ps` shows `(healthy)` once it's up
(it hits `127.0.0.1` internally — an earlier version used `localhost`, which
some Docker setups resolve to IPv6 and reported a false `unhealthy` even though
the site was serving fine; that's fixed).

### One-command scripts

From the `MyLearnings` root, use the helper scripts instead of remembering the
compose commands (Python and shell versions both work — pick either):

```bash
python3 start.py        # build + start all plans (or: ./start.sh)
python3 stop.py         # stop + remove all plan containers (or: ./stop.sh)
python3 stop.py --clean # also delete the built images
```

They check that Docker is running, start everything, and print the URLs.

### Run from anywhere (zsh aliases)

```bash
python3 setup-aliases.py     # adds aliases to ~/.zshrc, then: source ~/.zshrc
```

After that, from any directory:

```bash
plans-start     # start all plans        plans-qr    # QR launcher for your phone
plans-stop      # stop all plans         plans-dir   # cd into MyLearnings
#                                         python3 setup-aliases.py --remove  # undo
```

The aliases point at this folder's absolute path, so they work from anywhere and
keep working as long as you don't move `MyLearnings` (re-run `setup-aliases.py`
if you do).

The same trackers are also hosted (private to your account) as artifacts:

- Python Backend Sprint — https://claude.ai/code/artifact/953c93d6-5403-4be3-9a6c-08c388a24e9d
- Docker Deploy Sprint — https://claude.ai/code/artifact/4675aa13-837e-4433-84d9-bccb240849b4
- Backend Infra Sprint — https://claude.ai/code/artifact/b620ef66-d22f-431b-81fa-491fb1189470
- Laravel Backend Sprint — https://claude.ai/code/artifact/5972791a-ea29-4b49-9826-337a1b9ba2a8
- RAG Sprint — https://claude.ai/code/artifact/a7e9764a-0f76-404d-904f-a35418cf90bc
- Machine Learning Sprint — https://claude.ai/code/artifact/d385d615-38bf-472e-95d3-a2630a056576
- Rust Sprint — https://claude.ai/code/artifact/8c6b8a0e-1dbb-4e47-84dc-d7e0c7ee55d9
- n8n Automation Sprint — https://claude.ai/code/artifact/b7e869f8-170b-4b6e-b3a3-ff3bbce0088c
- Reinforcement Learning Sprint — https://claude.ai/code/artifact/b82b229e-0c30-40a7-8697-9aeda825fa83
- Data Analysis Sprint — https://claude.ai/code/artifact/82211a03-5c24-46b8-b248-922a25fccf93
- Deep Learning Sprint — https://claude.ai/code/artifact/3996997b-561a-412a-9fc8-f754da874ad2
- AI Agents Sprint — https://claude.ai/code/artifact/b42ec521-d74c-481b-ae67-58a14966c4a5
- Fine-Tuning Sprint — https://claude.ai/code/artifact/d29b2566-4b1c-4034-baf8-07c1432cbf5c
- MLOps Sprint — https://claude.ai/code/artifact/a8468246-4ee9-4bb1-a7f4-8d7b538dbeb8
- Data Engineering Sprint — https://claude.ai/code/artifact/1d397921-9226-414d-a9fc-e9b317288f14
- Cloud & Kubernetes Sprint — https://claude.ai/code/artifact/66f37d0b-f0ac-4ec8-9c80-14bfa8e26ab9
- Math for ML Sprint — https://claude.ai/code/artifact/308d65c0-db6f-4801-a831-5b978c372ac0
- Freelancing Success Sprint — https://claude.ai/code/artifact/d35ea5c1-4642-4d38-86f3-b9ca5465140b
- Technical Terms Sprint — https://claude.ai/artifact/B6csB5evxwR8ChN565gWKq

## Reaching the plans from your phone

**Easiest — scan a QR code.** With the plans running and your phone on the same
Wi-Fi:

```bash
python3 launcher.py      # or the alias: plans-qr
```

This opens **`plans-launcher.html`** in your browser with this computer's Wi-Fi
IP auto-detected and filled in. Each plan gets its own QR code — point your phone
camera at one and it opens that plan directly. The page is fully self-contained
(the QR generator is inlined, so it works even with no internet), remembers your
IP, and has a light/dark toggle. If auto-detect misses, type your IP
(`ipconfig getifaddr en0` on a Mac) into the box and the codes regenerate.

**By hand:** find your Mac's IP (`ipconfig getifaddr en0`) and open
`http://<that-ip>:<port>` on your phone.

**From anywhere (off your Wi-Fi):** use `tools/tunnel/tunnel.sh`
(Tailscale / Cloudflare / ngrok — create the tunnel once, then the address stays
the same). See that folder's notes.

## A suggested path

1. **Python** (languages) — your main new backend language.
2. **Docker** — containerize what you build.
3. **Backend Infra** (Redis · Queues · Mailpit) — the async backbone.

Then the **AI/ML-engineering stack**, in dependency order:

4. **Math for ML** (foundations) — *optional but clarifying*: the intuition under
   everything below (vectors, gradients, probability). Take it first if you want
   the internals, or dip in when a concept bites.
5. **Data Analysis** — the foundation: pandas, SQL, stats, viz. Everything below
   starts as clean, well-understood data.
6. **Data Engineering** — reliable pipelines (ELT, orchestration, warehouses) that
   *deliver* that data at scale.
7. **Machine Learning** — predict and detect patterns (regression, classification,
   clustering).
8. **Deep Learning** (PyTorch) — neural networks, for perceptual data and where
   classic ML runs out.
9. **Reinforcement Learning** — the "act on information" layer: agents that learn
   which decisions pay off.
10. **RAG** then **AI Agents** — the LLM application layer; agents build on the LLM
    tool-calling in the Python book and use RAG for memory.
11. **Fine-Tuning** — change the model's weights only when prompting, RAG, and
    agents can't get there. It builds on all of the above.

Then the **shipping layer** — how all of the above reaches production:

12. **MLOps** — track, version, serve, monitor, and retrain models like real
    software. The engineering half of the ML-engineer role.
13. **Cloud & Kubernetes** — run and scale services and models (GPUs, autoscaling,
    serving) on a cluster and the cloud.

And a **parallel career track**, runnable any time once you have a sellable skill:

- **Freelancing** — turn all of the above into income on Upwork, Toptal, Fiverr and
  beyond. It leads with your rare AI/ML edge as a premium niche, so it pairs best
  once you've built a couple of the technical tracks to show as proof.

**PHP & Laravel** and **Rust** are independent tracks — take Laravel when the work
calls for it, and Rust when you want performance, memory safety, and a new mental
model (it maps cleanly from your TypeScript).

**n8n** is a standalone track best taken *after* Backend Infra — it's the visual,
trigger-driven counterpart to the code-first queues and glue you learn there, and
its Week 3 AI workflows build on the RAG plan.

*Built as a matched set: every plan maps chapter-by-chapter to its cookbook, and
every cookbook is framed against a language you already know.*
