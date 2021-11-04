---
date: 2020-06-30
title: Extrapolation and compositionality
categories:
  - ai
  - meta
image:
  source: https://source.unsplash.com/kn-UmDZQDjM
description: Can we teach machines to extrapolate ?
---

In many applications, being able to extrapolate to unseen regions of the training space would give a tremendous edge to machine-learning algorithms, potentially unlocking entire ranges of applications.

<!-- Humans are very good at it: to a large extent, the very purpose of science is to find general laws that apply  -->

Computational drug discovery provides a [perfect example of how extrapolation can help]({% link _i18n/en/_posts/2020-02-29-meta-learning-for-drug-discovery.md %}): given the immensity of the molecular space, it is paramount to be able to extrapolate the insights gathered on the training data to unseen regions.

But this is problematic. How can you know how the environment behaves in a totally unexplored region of inputs? {% include ref_fig.html label=1 capitalise=true %} represents four univariable functions that coincide perfectly on some region of the reals. Imagine we train an algorithm on the shared portion of the $x$ axis: how could it decide which function best describes the training data once we go beyond their scope?

{% include figure.html source="/assets/images/meta/extrapolation.png" caption="Which one should we choose? Four functions that coincide..." %}

As of today, machine-learning algorithms are essentially function approximators that are very effective at _interpolating_ between datapoints, provided they come in sufficient numbers. Extrapolation is not only elusive but also impossible without formulating some heavy assumptions on the structure of the problem.

In the case of molecular scoring, the underlying hypothesis that lets us hope to one day extrapolate beyond the scope of the training data is the _compositionality_ assumption. In a compositional problem we can derive some law that governs, at least partly, the observed phenomenon.

To a large extent, science itself is a compositional success story. The very purpose of science is to find general laws that hold in every condition. Robert Hooke was able to formulate [his law](https://en.wikipedia.org/wiki/Hooke%27s_law) linking the force needed to extend a spring to the elongation of the latter precisely because that problem is indeed compositional.

If you can retrieve the compositional structure of a problem, provided it exists, then you get two precious assets. First, it means you can use your model for extrapolation (which is the whole point). Second, the amount of data needed to train it is substantially reduced: in the case of Hooke's law, you only need a single measurement to estimate the stiffness of the spring. A brute-force deep-learning approach would require countless examples to learn the linear relationship, and would lamentably fail as soon as we leave the training region.

<!-- Hence, we posit that much of a compound's activity is driven by the interactions between its chemical substructures, along with some fringe region-specific adjustments. That is to say, we do not discard region-specific knowledge as non-informative. Rather, we hypothesise the bulk of a compound's property can be inferred by looking at features that are compositional, and thus apply in a broader region of the molecular space.

At this point, you might get anxious that the assumption may not hold, and computational drug discovery be doomed. Let me share some reassuring thoughts.
* First, we know that compositionality exists in the realm of molecular properties. Indeed, it is the only reason chemistry itself, as a discipline, exits.
* Second, computational drug discovery itself does not rely on extrapolation. Should the compositionality assumption break, we would be forced to stick to the limited scope of the training data. But keep in mind that it still represents plenty of samples to go through, and traditional drug discovery has thriven without extrapolation since its beginnings. -->


## Can we infer the structure of a problem?

The next question
