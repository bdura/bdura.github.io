---
date: 2020-06-29
title: Teaching machines to learn with meta-learning
categories:
  - ai
image:
  source: https://source.unsplash.com/OyCl7Y4y0Bk
summary: Although machine-learning has shown great success in many areas, human-like intelligence is still well beyond our reach. Meta-learning can help.
---

Although machine-learning has shown great success in many areas, human-like intelligence is still well beyond our reach.

With the help of deep learning, machines have become especially good at doing function approximation, and can thus solve complex tasks as long as:
* The task is well-defined, ie there is a clear objective/cost function to minimise.
* The task is fixed, in the sense that the distribution does not shift between the training examples and the data the network will encounter _in the wild_.
* **Huge** amounts of training examples are available. For example, Inception (a well-known image-recognition model) was trained on 1.2 million images {% cite inception %}...

On the contrary, machines are still famously bad at generalising from very few data points, or work in non-stationary environments (where the data distributions changes); two abilities at which humans excel.

Moreover, it is still strikingly hard to transfer knowledge across tasks.
Imagine you are training a network to recognise cats from dogs, and another to classify between birds and horses.
Since natural images share so much structural information, it seems clear that each tasks can benefit from the other, especially if the amount of data available is limited.

More generally, there are many use cases where we have access to numerous tasks that share a significant amount of structure and would benefit from being learnt in parallel. With the traditional machine-learning toolbox however, sharing knowledge across problems is tricky.


## Traditional machine-learning and notations

In supervised learning, the training procedure aims to find the parameters that minimise the _loss_ on the training set. More formally, given a model $f_\theta$ parametrised by $\theta$, our goal is to find $\theta^\star$ that minimises the expected loss on the training set:

{% equation %}
\theta^\star = \argmin_\theta \metaloss (\Dtrain \mid \theta) = \argmin_\theta \; \E_{x, y \in \Dtrain} \LB \loss (y, f_\theta(x)_t) \RB,
{% endequation %}

where $\loss$ is the loss function and $\Dtrain$ is the training set where $x$ is the input and $y$ is the target.

One immediate way to use the knowledge gathered across tasks with traditional machine-learning is to explicitly share the learnt parametres.

{% include figure.html source='https://docs.google.com/drawings/d/e/2PACX-1vSAYye2BpBa1ZOByvFEx3mJjFjzfqgfWjvv21OHModJjvdkBsv5fvO0NUlDkMbzS26p_OfUXy8vikGB/pub?w=1604&h=401' caption='Multi-task learning' %}

{% include ref_fig.html label=1 capitalise=true %} shows the most basic form of multi-task learning, wherein the model is trained on every task at once. The network makes a prediction for each task and the task label, fed along the input, is used to select which component to pass along.

Multi-task learning is a good attempt at learning from more than one task, and belonging to the traditional machine-learning toolbox, it is easy to implement. However, it assumes that the tasks are known beforehand. By itself it cannot help learn faster on a new task, or if the distribution changes –ever so slightly.


## Learning to learn with meta-learning

The meta-learning paradigm takes a radically different approach: instead of sharing parametres explicitly, a meta-learning algorithm **learns how to learn** during the training procedure. That way, it will adapt more rapidly when it is released "in the wild".

To achieve this feat, the meta-learning objective aims to minimise the average **generalisation error on a set of training tasks** rather than the average loss on a set of individual examples.

#### The meta-dataset

In meta-learning, we work with collections of datasets, or **meta-datasets**, which describe multiple tasks over which the training loop iterates.
As usual, we divide the meta-dataset into a training collection $\Dmtrain$ and a test collection $\Dmtest$. At test time, it is absolutely paramount to test the generalisation performance **on new tasks that were not seen during training**. Otherwise, it is **not meta-learning**.

Given a task $t$, the training procedure generates a support set $\Dsupport$, used to adapt the model, and a query set $\Dquery$, used to test its generalisation performance.

#### The meta-objective

Formally, the meta-learning objective is in the form:

{% equation %}
  \label{eq:maml}
  \argmin_\theta \; \E_{t \in \Dmtrain} \LB \metaloss (\Dquery \mid \theta, \Dsupport) \RB,
{% endequation %}

where $\metaloss (\Dquery \mid \theta, \Dsupport)$ is the generalisation error on $\Dquery$ after adaptation on $\Dsupport$.


#### The training loop

{% include ref_algo.html label=1 capitalise=true %} shows how the training procedure can teach a network to learn faster.

{% include algorithm.html caption='The meta-learning training loop' code="
\begin{algorithm}
  \caption{The meta-learning training loop}
  \begin{algorithmic}
    \REQUIRE $\tau(t)$: distribution over tasks
    \STATE Randomly initialise $\theta$
    \WHILE{not done}
      \STATE Sample batch $T$ of tasks $t \sim \tau(t)$
      \FORALL{$t$}
        \STATE Sample support and query sets ${D_{\mathrm{support}}^t}$ and ${D_{\mathrm{query}}^t}$
        \STATE Adapt the model to ${D_{\mathrm{support}}^t}$
        \STATE Evaluate the generalisation loss $\mathcal{L}({D_{\mathrm{query}}^t} \mid \theta_t, {D_{\mathrm{support}}^t})$
      \ENDFOR
      \STATE Update $\theta$ to minimise the empirical meta-risk $\frac{1}{|T|} \sum_{t \in T} \mathcal{L}({D_{\mathrm{query}}^t} \mid \theta_t, {D_{\mathrm{support}}^t})$
    \ENDWHILE
  \end{algorithmic}
\end{algorithm}
"%}

The fact that in meta-learning we minimise the error after adaptation may raise a red flag: in traditional machine-learning, doing so would bias your network towards the validation set and lose some of its generalisation capabilities. But remember: meta-learning is about learning to learn better. In this case, the validation error is computed on a held-out set of tasks and using the same adaptation/evaluation procedure.


#### Model-agnostic meta-learning

Model-agnostic meta-learning, or MAML, is one of the most commonly used meta-learning method. Its popularity stems in part from the fact that it can adapt any differentiable machine-learning algorithm to meta-learning.

{% include algorithm.html caption='Model-agnostic meta-learning' reference='finn2017model' code="
\begin{algorithm}
  \caption{Model-Agnostic Meta-Learning}
  \begin{algorithmic}
    \REQUIRE $\tau(t)$: distribution over tasks
    \REQUIRE $\alpha$, $\beta$: step size hyper-parameters
    \STATE Randomly initialise $\theta$
    \WHILE{not done}
      \STATE Sample batch $T$ of tasks $t \sim \tau(t)$
      \FORALL{$t$}
        \STATE Sample support and query sets ${D_{\mathrm{support}}^t}$ and ${D_{\mathrm{query}}^t}$
        \STATE Evaluate $\nabla_\theta \mathcal{L}({D_{\mathrm{support}}^t} \mid \theta)$ with respect to the support set
        \STATE Compute adapted parameters with gradient descent:
        $\theta_t=\theta-\alpha \nabla_\theta \mathcal{L}({D_{\mathrm{support}}^t} \mid \theta)$
      \ENDFOR
      \STATE Update $\theta \leftarrow \theta - \beta \nabla_\theta \sum_{t \in T}  \mathcal{L}({D_{\mathrm{query}}^t} \mid \theta_t)$
    \ENDWHILE
  \end{algorithmic}
\end{algorithm}
"%}

<!-- {% include ref_algo.html label=1 capitalise=true %} -->
