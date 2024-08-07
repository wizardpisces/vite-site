# 《The Bitter Lesson》 

"The Bitter Lesson"是一篇由计算机科学家理查德·萨顿（Richard Sutton）撰写的论文。它提出了一个重要的观点，即在人工智能和机器学习的发展过程中，最重要的教训是利用计算资源和数据量的增长。

## 文章的几个观念

* 传统的人工智能方法受限：在过去的几十年中，人们在构建人工智能系统中主要依赖于手动设计的规则和特定的专家知识。然而，这种方法面临着挑战，因为设计和实现这些规则往往非常复杂，且需要大量的专业领域知识。
* 利用计算资源和数据量的增长优势：随着计算资源和数据量的增长，我们可以采用更简单且更通用的方法来构建人工智能系统。这种方法通过大规模的数据和计算能力来训练机器学习模型，使其根据数据自动地学习规律和特征。
* 从神经网络的再兴中得出教训：神经网络的成功复兴是一种不同的方法论，它充分利用了计算资源和数据量的增长。通过使用更大和更深的神经网络，以及大规模训练数据，神经网络能够实现各种复杂的任务，包括图像识别、自然语言处理等。
* 简单通用的方法更具优势：在发展人工智能和机器学习方法时，应该倾向于更简单而通用的方法。这些方法具有更好的扩展性和适应性，可以从更少的先验知识和人工规则中进行学习，使系统能够在更广泛的任务和环境中表现出色。

总的来说，"The Bitter Lesson"表达了一种重要的观点，即在人工智能和机器学习领域中，随着计算资源和数据量的增长，通过利用更简单且更通用的方法，让机器从数据中自动学习更多的规律和特征，可能会比依赖于手动设计的复杂规则更具优势。

## 几个例子论证

* 象棋和围棋：这两种棋类游戏都是人工智能研究的经典领域，也是大规模计算的一般方法取得突破性进展的领域。例如，AlphaGo 和 AlphaZero 都是基于深度神经网络和强化学习的系统，它们可以通过自我对弈来提高自己的水平，而**不需要人类的先验知识**。这些系统在与人类顶尖棋手的对决中，展示了超越人类的水平。

* 图像识别：这是人工智能研究的另一个重要领域，也是大规模计算的一般方法取得显著进步的领域。例如，Midjourney V5 是一种能够根据文本描述生成高质量图像的系统，它是基于深度生成对抗网络 (GAN) 的技术，它可以从大量的图像数据中学习图像的特征和分布，而**不需要人类的领域知识**。这种系统在图像创作和图像编辑等任务中，展示了惊人的创造力和灵活性。
  * SAM 模型比 UNet 更加通用，SAM 采用了一种提示型的训练方法（UNet 是监督学习），通过提示来生成分割掩码，使其具有**更强大的零样本泛化能力**。

* ChatGPT：这是一种基于 GPT-4 的语言模型，它可以根据上下文理解和生成类似人类的文本，它也是基于大规模计算的一般方法的一个例子，它可以从海量的文本数据中学习语言的规律和知识，而**不需要人类的规则或语法**。这种系统在对话、写作、翻译等任务中，展示了流畅的语言能力和广泛的知识面。

## 通用性的局限性

* **忽略了问题的特殊性和复杂性**，导致无法找到最优的或最合适的解决方案。例如，一些通用的机器学习算法可能无法适应一些特定的数据分布或任务需求，需要进行定制化的改进或设计。
  * 例子：使用通用的神经网络来识别手写数字时，可能会遇到一些噪声、模糊或变形的数字，这些数字可能与训练数据集中的数字有很大的差异，导致识别的准确率下降。
* **需要大量的计算资源和数据**，导致效率低下或成本高昂。例如，一些通用的深度学习模型可能需要数百万甚至数十亿的参数，需要大规模的硬件设备和数据集来训练和部署。
  * 
* **安全性或可靠性的风险**，导致不可预测的或不可控制的后果。例如，一些通用的人工智能系统可能会受到对抗攻击或数据污染的影响，导致输出错误的或有害的结果 。

## 原文
* [the bitter lesson](http://www.incompleteideas.net/IncIdeas/BitterLesson.html)