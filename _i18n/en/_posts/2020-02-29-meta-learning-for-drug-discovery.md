---
date: 2020-02-29
title: Meta-learning for drug discovery
categories:
  - ai
  - pharma
image:
  source: https://source.unsplash.com/0tfz7ZoXaWc
  legend:
  reference:
---

This post presents the report I wrote to finalise an internship at [InVivo AI](https://invivoai.com/), a Montréal-based startup aiming to bring few-shot learning to drug discovery.

You can find the full report [here](/assets/files/Meta-learning for drug discovery.pdf). It is divided into four parts:

1. First, I give a succinct presentation of a typical drug discovery pipeline and discuss how machine-learning could help, as well as propose a set of desiderata for a drug-discovery algorithm.

2. Then, I look at how traditional machine-learning has started to yield some results.

3. Third, I argue that given the scarcity and noise of training data, the answer may lie in learning from multiple tasks and present a relatively new machine-learning paradigm, namely _meta-learning_.

4. Finally, I describe one particular project that I worked on during the internship, namely "Adaptive Deep Kernel Learning", a method we proposed to address the desiderata formulated to work with molecular data.


## Drug discovery

Drug discovery is the process of finding novel compounds apt to act on a specific target in order to stop, treat and cure a disease.

{% include figure.html source='/assets/images/invivo/drug-discovery.jpg' caption='The traditional drug discovery pipeline' reference='janssen2019' %}

As {% include ref_fig.html label=1 %} shows, the search begins with a long and tedious process of _in vitro_ testing on as many as 10 000 to 15 000 candidate molecular compounds.

At the end of that step, which lasts three to six years, only a handful of compounds move on to the next phase. In many ways, this step is akin to looking for a needle in a haystack: although the process can be guided by some form of empirical knowledge, the latter is vastly insufficient to reduce the duration of the pre-clinical phase by any significant amount.

From there, another six to seven years of human clinical trials are necessary to validate the effects of the retained compounds.


## Computational drug discovery

Computational drug discovery can be summarised into three distinct but coupled problems:

1. **Scoring**. "Scoring" a molecule, or estimating its properties, is the first building block of an artificial intelligence that can help discover new drugs.

2. **Generation**. There are an estimated 10<sup>60</sup> possible small molecules
   {% cite chemicalspace %}, while the largest molecular databases hold at most a hundred millions of them...

3. **Optimisation**. Combining a good generation strategy to efficiently explore the space of small molecules and an accurate scoring function, we may one day be able to optimise for compounds directly: given a set of desirable properties, the algorithm would propose candidates that are designed to perform best.

We can define a few desiderata for a good machine-learning algorithm for drug discovery :
* **Representation**, to get the most information.
* **Extrapolation**, to be able to score significantly different compounds.
* **Data efficiency**, given the dire scarcity of training examples.
* **Calibration**, to be able to assess the level of confidence on the model's predictions.

## Meta-learning

Note that the traditional machine-learning objective is in the form:

{% equation %}
\argmin_\theta \metaloss (\Dtrain \mid \theta) = \argmin_\theta \E_{x, y \in \Dtrain} \LB \loss (y, f_\theta(x)_t) \RB
{% endequation %}

where $\loss$ is the loss function, $f_\theta$ is the model parametrised by $\theta$, $x$ is the input and $y$ is the target.

A new range of algorithms has been developed in recent years in order to tackle the issue of generalising from very few examples. The paradigm, called meta-learning, aims at “learning to learn” from a collection of machine-learning problems that share a substantial amount of structure, by designing the objective function in such a way that the algorithm is explicitly trained to learn faster.

Instead of minimising the average loss on a set of individual examples, the meta-learning objective aims to minimise the average generalisation error on a set of training tasks. More formally, the meta-learning objective is in the form:
{% equation %}
  \label{eq:maml}
  \argmin_\theta \E_{t \in \Dmtrain} \LB \metaloss (\Dquery \mid \theta, \Dsupport) \RB
{% endequation %}

Where $t$ is a task from $\Dmtrain$, the _meta-training set_. Each task comes with _support_ and _query_ sets, corresponding to the training and validation sets in the traditional setting.

{% include figure.html source='https://docs.google.com/drawings/d/e/2PACX-1vTmM4I87M3EzlrnEvEqAEfyj5qf4s-GhXqMORuEHkNENLijSotokbB0mmKlGpDtImGXv0xPMGsrpc__/pub?w=584&h=537' caption='The meta-training loop' %}
